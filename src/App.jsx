import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Briefcase,
  Database,
  Download,
  FileJson,
  GitBranch,
  Menu,
  RotateCcw,
  TrendingUp,
  Upload,
  Users,
  X,
} from 'lucide-react';
import EmployeeManagement from './components/EmployeeManagement';
import ProjectManagement from './components/ProjectManagement';
import InvolvementManagement from './components/InvolvementManagement';
import FinancialDashboard from './components/FinancialDashboard';
import {
  SAMPLE_DATA,
  calculateDepartmentMetrics,
  calculateEmployeeMetrics,
  calculateProjectMetrics,
} from './utils/finance';

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [employees, setEmployees] = useState(() => loadFromStorage('employees', []));
  const [projects, setProjects] = useState(() => loadFromStorage('projects', []));
  const [involvements, setInvolvements] = useState(() => loadFromStorage('involvements', []));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('employees', JSON.stringify(employees));
    } catch {
      // Ignore storage errors
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem('projects', JSON.stringify(projects));
    } catch {
      // Ignore storage errors
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('involvements', JSON.stringify(involvements));
    } catch {
      // Ignore storage errors
    }
  }, [involvements]);

  const employeeValue = useMemo(
    () => calculateEmployeeMetrics(employees, projects, involvements),
    [employees, projects, involvements]
  );

  const projectMetrics = useMemo(
    () => calculateProjectMetrics(employees, projects, involvements),
    [employees, projects, involvements]
  );

  const departmentMetrics = useMemo(
    () => calculateDepartmentMetrics(employees, employeeValue),
    [employees, employeeValue]
  );

  const handleDeleteEmployee = (id) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    setInvolvements((prev) => prev.filter((inv) => inv.employeeId !== id));
  };

  const handleDeleteProject = (id) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id));
    setInvolvements((prev) => prev.filter((inv) => inv.projectId !== id));
  };

  const handleLoadSampleData = () => {
    if (
      (employees.length > 0 || projects.length > 0 || involvements.length > 0) &&
      !window.confirm('Replace current data with sample enterprise dataset?')
    ) {
      return;
    }
    setEmployees(SAMPLE_DATA.employees);
    setProjects(SAMPLE_DATA.projects);
    setInvolvements(SAMPLE_DATA.involvements);
    setActiveTab('dashboard');
  };

  const handleResetAll = () => {
    if (!window.confirm('Clear all employees, projects, and involvements?')) return;
    setEmployees([]);
    setProjects([]);
    setInvolvements([]);
  };

  const handleExportCsv = () => {
    const rows = [
      [
        'Employee',
        'Role',
        'Department',
        'Monthly Cost',
        'Allocated Months',
        'Total Cost',
        'Value Generated',
        'Net Value',
        'ROI (%)',
        'Active Allocation (%)',
      ],
      ...employees.map((emp) => {
        const m = employeeValue[emp.id] || {};
        return [
          `"${(emp.name || '').replace(/"/g, '""')}"`,
          `"${(emp.role || '').replace(/"/g, '""')}"`,
          `"${(emp.department || 'Engineering').replace(/"/g, '""')}"`,
          (m.monthlyCost || 0).toFixed(2),
          m.totalMonthsWorked || 0,
          (m.totalCost || 0).toFixed(2),
          (m.totalValueGenerated || 0).toFixed(2),
          (m.netValue || 0).toFixed(2),
          (m.roi || 0).toFixed(1),
          m.activeAllocation || 0,
        ];
      }),
    ];

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `valuepulse-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const payload = { employees, projects, involvements, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `valuepulse-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result);
        if (
          data &&
          Array.isArray(data.employees) &&
          Array.isArray(data.projects) &&
          Array.isArray(data.involvements)
        ) {
          setEmployees(data.employees);
          setProjects(data.projects);
          setInvolvements(data.involvements);
          setActiveTab('dashboard');
        } else {
          window.alert('Invalid ValuePulse backup file.');
        }
      } catch {
        window.alert('Could not parse JSON backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const tabs = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: TrendingUp, count: null },
    { id: 'employees', label: 'Employees', icon: Users, count: employees.length },
    { id: 'projects', label: 'Projects', icon: Briefcase, count: projects.length },
    { id: 'involvements', label: 'Allocations', icon: GitBranch, count: involvements.length },
  ];

  const overAllocatedCount = Object.values(employeeValue).filter(
    (e) => e.activeAllocation > 100
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 lg:flex">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 text-white lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 font-bold text-white">
            VP
          </div>
          <span className="text-base font-bold tracking-tight">ValuePulse</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } fixed inset-y-0 left-0 z-40 w-72 shrink-0 flex-col justify-between border-r border-slate-800 bg-slate-900 p-5 text-slate-100 lg:sticky lg:top-0 lg:flex lg:h-screen`}
      >
        <div>
          <div className="hidden items-center gap-3 px-2 pb-6 lg:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-extrabold text-white shadow-md">
              VP
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">ValuePulse</h1>
              <p className="text-xs text-slate-400">Workforce ROI Intelligence</p>
            </div>
          </div>

          <nav className="mt-2 space-y-1.5" aria-label="Workspace sections">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </span>
                  {tab.count !== null && (
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {overAllocatedCount > 0 && (
            <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-200">
              <p className="font-semibold text-rose-300">Allocation Alert</p>
              <p className="mt-1 text-rose-200/80">
                {overAllocatedCount}{' '}
                {overAllocatedCount === 1 ? 'employee is' : 'employees are'} allocated
                above 100% capacity.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Utilities */}
        <div className="mt-8 space-y-2 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={handleLoadSampleData}
            className="flex w-full items-center gap-2.5 rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            <Database size={15} className="text-cyan-400" />
            <span>Load Sample Data</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={employees.length === 0}
            className="flex w-full items-center gap-2.5 rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={15} className="text-emerald-400" />
            <span>Export CSV Report</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              disabled={employees.length === 0 && projects.length === 0}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/60 px-2.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FileJson size={14} className="text-violet-400" />
              <span>Backup</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/60 px-2.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              <Upload size={14} className="text-amber-400" />
              <span>Restore</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportJson}
              className="hidden"
            />
          </div>

          {(employees.length > 0 || projects.length > 0 || involvements.length > 0) && (
            <button
              type="button"
              onClick={handleResetAll}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"
            >
              <RotateCcw size={15} />
              <span>Reset All Data</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl">
          {activeTab === 'dashboard' && (
            <FinancialDashboard
              employeeValue={employeeValue}
              employees={employees}
              projectMetrics={projectMetrics}
              departmentMetrics={departmentMetrics}
              onLoadSampleData={handleLoadSampleData}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeeManagement
              employees={employees}
              setEmployees={setEmployees}
              employeeValue={employeeValue}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectManagement
              projects={projects}
              setProjects={setProjects}
              projectMetrics={projectMetrics}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {activeTab === 'involvements' && (
            <InvolvementManagement
              involvements={involvements}
              setInvolvements={setInvolvements}
              employees={employees}
              projects={projects}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
