import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Briefcase,
  Database,
  DollarSign,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import { formatCurrency } from '../utils/finance';

const SORT_FIELDS = [
  { value: 'netValue', label: 'Net Value (High → Low)' },
  { value: 'roi', label: 'ROI % (High → Low)' },
  { value: 'valueGenerated', label: 'Value Generated' },
  { value: 'allocation', label: 'Active Allocation' },
];

const FinancialDashboard = ({
  employeeValue,
  employees,
  projectMetrics,
  departmentMetrics = [],
  onLoadSampleData,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('netValue');

  const values = useMemo(() => Object.values(employeeValue), [employeeValue]);

  const totals = useMemo(() => {
    const totalCost = values.reduce((sum, emp) => sum + emp.totalCost, 0);
    const totalValueGenerated = values.reduce(
      (sum, emp) => sum + emp.totalValueGenerated,
      0
    );
    const netImpact = totalValueGenerated - totalCost;
    const blendedRoi = totalCost > 0 ? (netImpact / totalCost) * 100 : 0;
    const avgAllocation =
      values.length > 0
        ? values.reduce((sum, emp) => sum + emp.activeAllocation, 0) / values.length
        : 0;

    return { totalCost, totalValueGenerated, netImpact, blendedRoi, avgAllocation };
  }, [values]);

  const maxChartScale = useMemo(() => {
    const maxVal = values.reduce(
      (max, emp) => Math.max(max, emp.totalValueGenerated, emp.totalCost),
      0
    );
    return maxVal > 0 ? maxVal : 1;
  }, [values]);

  const topPerformers = useMemo(
    () =>
      [...values]
        .filter((e) => e.projectCount > 0)
        .sort((a, b) => b.netValue - a.netValue)
        .slice(0, 3),
    [values]
  );

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = employees
      .map((emp) => ({
        ...emp,
        metrics: employeeValue[emp.id] || {
          monthlyCost: emp.salary / 12,
          totalMonthsWorked: 0,
          totalCost: 0,
          totalValueGenerated: 0,
          netValue: 0,
          roi: 0,
          activeAllocation: 0,
          projectCount: 0,
        },
      }))
      .filter(
        (item) =>
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.role.toLowerCase().includes(q) ||
          (item.department || '').toLowerCase().includes(q)
      );

    return list.sort((a, b) => {
      if (sortBy === 'roi') return b.metrics.roi - a.metrics.roi;
      if (sortBy === 'valueGenerated')
        return b.metrics.totalValueGenerated - a.metrics.totalValueGenerated;
      if (sortBy === 'allocation')
        return b.metrics.activeAllocation - a.metrics.activeAllocation;
      return b.metrics.netValue - a.metrics.netValue;
    });
  }, [employees, employeeValue, search, sortBy]);

  if (employees.length === 0 && projectMetrics.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
          <TrendingUp size={28} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Welcome to ValuePulse
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          Add employees, projects, and allocations to calculate allocation-weighted
          ROI, project margins, and utilization—or load a sample dataset to explore
          right away.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onLoadSampleData}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            <Database size={16} />
            <span>Load Sample Dataset</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('employees')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Users size={16} />
            <span>Add Employee Manually</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Executive Financial Overview
          </h2>
          <p className="text-sm text-slate-500">
            Allocation-weighted labor cost vs. project value generated
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Allocated Cost
            </span>
            <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <DollarSign size={18} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">
            {formatCurrency(totals.totalCost)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Value Generated
            </span>
            <span className="rounded-lg bg-cyan-50 p-2 text-cyan-600">
              <TrendingUp size={18} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">
            {formatCurrency(totals.totalValueGenerated)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            From {projectMetrics.length} {projectMetrics.length === 1 ? 'project' : 'projects'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Net Financial Impact
            </span>
            <span
              className={`rounded-lg p-2 ${
                totals.netImpact >= 0
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {totals.netImpact >= 0 ? (
                <ArrowUpRight size={18} />
              ) : (
                <ArrowDownRight size={18} />
              )}
            </span>
          </div>
          <p
            className={`mt-3 text-2xl font-bold tabular-nums ${
              totals.netImpact >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(totals.netImpact)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Blended ROI:{' '}
            <span className="font-semibold text-slate-700">
              {totals.blendedRoi.toFixed(1)}%
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Avg Utilization
            </span>
            <span className="rounded-lg bg-violet-50 p-2 text-violet-600">
              <Award size={18} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">
            {totals.avgAllocation.toFixed(0)}%
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                totals.avgAllocation > 100 ? 'bg-rose-500' : 'bg-violet-600'
              }`}
              style={{ width: `${Math.min(100, totals.avgAllocation)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top Performers & Project Profitability */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Performers */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Award size={18} className="text-amber-500" />
            <span>Top Value Generators</span>
          </h3>

          {topPerformers.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Assign employees to projects to rank top value generators.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {topPerformers.map((performer, idx) => (
                <div
                  key={performer.employeeId}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {performer.employeeName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {performer.role} &middot; {performer.projectCount}{' '}
                        {performer.projectCount === 1 ? 'project' : 'projects'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold tabular-nums ${
                        performer.netValue >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(performer.netValue)}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      ROI {performer.roi.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Project Profitability */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Briefcase size={18} className="text-cyan-600" />
            <span>Project Profitability</span>
          </h3>

          {projectMetrics.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No projects created yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {projectMetrics.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{proj.name}</p>
                      <p className="text-xs text-slate-500">
                        {proj.teamSize} {proj.teamSize === 1 ? 'member' : 'members'} &middot;{' '}
                        {formatCurrency(proj.totalValue)} contract
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold tabular-nums ${
                          proj.margin >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatCurrency(proj.margin)} margin
                      </p>
                      <p className="text-xs text-slate-500">
                        Cost {formatCurrency(proj.laborCost)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Value vs Cost Comparison & Department Breakdown */}
      {(values.length > 0 || departmentMetrics.length > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Value vs Cost Chart */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Value vs. Cost Comparison
              </h3>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                  Value
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-slate-400" />
                  Cost
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              {values.map((emp) => {
                const valuePct = Math.round((emp.totalValueGenerated / maxChartScale) * 100);
                const costPct = Math.round((emp.totalCost / maxChartScale) * 100);
                return (
                  <div key={emp.employeeId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{emp.employeeName}</span>
                      <span className="tabular-nums text-slate-500">
                        {formatCurrency(emp.totalValueGenerated)} / {formatCurrency(emp.totalCost)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${valuePct}%` }}
                        />
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-400 transition-all duration-300"
                          style={{ width: `${costPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Department Breakdown */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="mb-4 text-base font-bold text-slate-900">
              Department Performance
            </h3>
            <div className="space-y-3">
              {departmentMetrics.map((dept) => (
                <div
                  key={dept.department}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{dept.department}</p>
                    <p className="text-xs text-slate-500">
                      {dept.headcount} {dept.headcount === 1 ? 'member' : 'members'} &middot; Cost{' '}
                      {formatCurrency(dept.totalCost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold tabular-nums ${
                        dept.netValue >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(dept.netValue)} net
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatCurrency(dept.totalValueGenerated)} generated
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Employee Financial Breakdown Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Employee Financial Breakdown
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter employees..."
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 outline-none focus:border-violet-500 focus:bg-white"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-violet-500"
            >
              {SORT_FIELDS.map((s) => (
                <option key={s.value} value={s.value}>
                  Sort: {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Allocation</th>
                <th className="px-6 py-3">Eff. Months</th>
                <th className="px-6 py-3">Allocated Cost</th>
                <th className="px-6 py-3">Value Generated</th>
                <th className="px-6 py-3">Net Value</th>
                <th className="px-6 py-3">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredEmployees.map((emp) => {
                const m = emp.metrics;
                const overAllocated = m.activeAllocation > 100;
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-slate-900">{emp.name}</p>
                      <p className="text-xs text-slate-500">
                        {emp.role} &middot; {emp.department || 'Engineering'}
                      </p>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                            overAllocated
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {overAllocated && <AlertTriangle size={12} />}
                          {m.activeAllocation}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 tabular-nums text-slate-700">
                      {m.totalMonthsWorked}
                    </td>
                    <td className="px-6 py-3.5 tabular-nums text-slate-700">
                      {formatCurrency(m.totalCost)}
                    </td>
                    <td className="px-6 py-3.5 tabular-nums text-slate-700">
                      {formatCurrency(m.totalValueGenerated)}
                    </td>
                    <td
                      className={`px-6 py-3.5 font-semibold tabular-nums ${
                        m.netValue >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(m.netValue)}
                    </td>
                    <td
                      className={`px-6 py-3.5 font-semibold tabular-nums ${
                        m.roi >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {m.roi.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default FinancialDashboard;
