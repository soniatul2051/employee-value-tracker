const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.4375;

/**
 * Calculates elapsed months between startDate and endDate (defaults to today).
 * Returns 0 if startDate is invalid or in the future relative to endDate.
 */
export function getElapsedMonths(startDateStr, endDateStr) {
  if (!startDateStr) return 0;
  const start = new Date(startDateStr);
  const now = new Date();
  const end = endDateStr ? new Date(endDateStr) : now;

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const effectiveEnd = end > now && !endDateStr ? now : end;
  if (effectiveEnd <= start) return 0;

  return Math.max(0, (effectiveEnd - start) / MS_PER_MONTH);
}

export function formatCurrency(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(dateStr) {
  if (!dateStr) return 'Present';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function isInvolvementActive(involvement) {
  const todayStr = new Date().toISOString().slice(0, 10);
  if (involvement.startDate && involvement.startDate > todayStr) return false;
  if (involvement.endDate && involvement.endDate < todayStr) return false;
  return true;
}

/**
 * Computes allocation-weighted financial metrics per employee.
 * Prevents double-counting salary when an employee works on concurrent projects.
 */
export function calculateEmployeeMetrics(employees, projects, involvements) {
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const valueMap = {};

  for (const employee of employees) {
    const salary = Number(employee.salary) || 0;
    const monthlyCost = salary / 12;
    const empInvolvements = involvements.filter((inv) => inv.employeeId === employee.id);

    let totalValueGenerated = 0;
    let totalCost = 0;
    let totalAllocatedMonths = 0;
    let activeAllocation = 0;
    let projectCount = 0;

    for (const inv of empInvolvements) {
      const project = projectMap.get(inv.projectId);
      if (!project) continue;

      const durationMonths = Math.max(1, Number(project.durationMonths) || 1);
      const totalProjectValue = Number(project.totalValue) || 0;
      const allocationPct = Math.max(0, Math.min(100, Number(inv.allocation) || 0));
      const months = getElapsedMonths(inv.startDate, inv.endDate);

      const projectValuePerMonth = totalProjectValue / durationMonths;
      const contribution = projectValuePerMonth * months * (allocationPct / 100);
      const allocatedCost = monthlyCost * months * (allocationPct / 100);

      totalValueGenerated += contribution;
      totalCost += allocatedCost;
      totalAllocatedMonths += months * (allocationPct / 100);
      projectCount += 1;

      if (isInvolvementActive(inv)) {
        activeAllocation += allocationPct;
      }
    }

    const netValue = totalValueGenerated - totalCost;
    const roi = totalCost > 0 ? (netValue / totalCost) * 100 : 0;

    valueMap[employee.id] = {
      employeeId: employee.id,
      employeeName: employee.name,
      role: employee.role,
      department: employee.department || 'Engineering',
      monthlyCost,
      totalCost,
      totalValueGenerated,
      netValue,
      roi,
      totalMonthsWorked: Number(totalAllocatedMonths.toFixed(1)),
      activeAllocation,
      projectCount,
    };
  }

  return valueMap;
}

/**
 * Computes financial profitability metrics per project.
 */
export function calculateProjectMetrics(employees, projects, involvements) {
  const employeeMap = new Map(employees.map((e) => [e.id, e]));

  return projects.map((project) => {
    const projInvolvements = involvements.filter((inv) => inv.projectId === project.id);
    const durationMonths = Math.max(1, Number(project.durationMonths) || 1);
    const totalValue = Number(project.totalValue) || 0;
    const monthlyValue = totalValue / durationMonths;

    let laborCost = 0;
    let earnedValue = 0;
    const teamMembers = new Set();

    for (const inv of projInvolvements) {
      const emp = employeeMap.get(inv.employeeId);
      if (!emp) continue;

      const monthlyCost = (Number(emp.salary) || 0) / 12;
      const allocationPct = Math.max(0, Math.min(100, Number(inv.allocation) || 0));
      const months = getElapsedMonths(inv.startDate, inv.endDate);

      laborCost += monthlyCost * months * (allocationPct / 100);
      earnedValue += monthlyValue * months * (allocationPct / 100);
      teamMembers.add(emp.id);
    }

    const margin = earnedValue - laborCost;
    const marginPct = earnedValue > 0 ? (margin / earnedValue) * 100 : 0;

    return {
      ...project,
      monthlyValue,
      laborCost,
      earnedValue,
      margin,
      marginPct,
      teamSize: teamMembers.size,
      involvementCount: projInvolvements.length,
    };
  });
}

/**
 * Aggregates headcount, cost, value generated, and net impact by department.
 */
export function calculateDepartmentMetrics(employees, employeeValue) {
  const deptMap = new Map();

  for (const emp of employees) {
    const dept = emp.department || 'Engineering';
    const metrics = employeeValue[emp.id] || {
      totalCost: 0,
      totalValueGenerated: 0,
      netValue: 0,
    };

    if (!deptMap.has(dept)) {
      deptMap.set(dept, {
        department: dept,
        headcount: 0,
        totalCost: 0,
        totalValueGenerated: 0,
        netValue: 0,
      });
    }

    const entry = deptMap.get(dept);
    entry.headcount += 1;
    entry.totalCost += metrics.totalCost;
    entry.totalValueGenerated += metrics.totalValueGenerated;
    entry.netValue += metrics.netValue;
  }

  return Array.from(deptMap.values()).sort((a, b) => b.netValue - a.netValue);
}

export const SAMPLE_DATA = {
  employees: [
    {
      id: 'emp-1',
      name: 'Aarav Sharma',
      role: 'Senior Full-Stack Engineer',
      department: 'Engineering',
      salary: 120000,
      hireDate: '2024-03-15',
    },
    {
      id: 'emp-2',
      name: 'Maya Lin',
      role: 'Product Designer',
      department: 'Design',
      salary: 96000,
      hireDate: '2024-06-01',
    },
    {
      id: 'emp-3',
      name: 'Liam Carter',
      role: 'Cloud Architect',
      department: 'Infrastructure',
      salary: 144000,
      hireDate: '2023-11-10',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'FinTech Analytics Portal',
      description: 'Real-time enterprise revenue & cohort analytics dashboard.',
      totalValue: 180000,
      durationMonths: 6,
      startDate: '2026-06-01',
      status: 'active',
    },
    {
      id: 'proj-2',
      name: 'Cloud Migration v2',
      description: 'Zero-downtime Kubernetes & multi-region database migration.',
      totalValue: 150000,
      durationMonths: 5,
      startDate: '2026-07-01',
      status: 'active',
    },
  ],
  involvements: [
    {
      id: 'inv-1',
      employeeId: 'emp-1',
      projectId: 'proj-1',
      role: 'Tech Lead',
      allocation: 70,
      startDate: '2026-06-01',
      endDate: '',
    },
    {
      id: 'inv-2',
      employeeId: 'emp-1',
      projectId: 'proj-2',
      role: 'Backend Advisor',
      allocation: 30,
      startDate: '2026-07-01',
      endDate: '',
    },
    {
      id: 'inv-3',
      employeeId: 'emp-2',
      projectId: 'proj-1',
      role: 'Lead UI/UX',
      allocation: 80,
      startDate: '2026-06-01',
      endDate: '',
    },
    {
      id: 'inv-4',
      employeeId: 'emp-3',
      projectId: 'proj-2',
      role: 'Principal Architect',
      allocation: 90,
      startDate: '2026-07-01',
      endDate: '',
    },
  ],
};
