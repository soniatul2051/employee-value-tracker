import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Edit2,
  Save,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/finance';

const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Infrastructure',
  'Operations',
  'Sales',
];

const EMPTY_FORM = {
  name: '',
  role: '',
  department: 'Engineering',
  salary: '',
  hireDate: '',
};

const EmployeeManagement = ({
  employees,
  setEmployees,
  employeeValue,
  onDeleteEmployee,
}) => {
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employees.filter((emp) => {
      const dept = emp.department || 'Engineering';
      if (deptFilter !== 'all' && dept !== deptFilter) return false;
      if (
        q &&
        !emp.name.toLowerCase().includes(q) &&
        !emp.role.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [employees, search, deptFilter]);

  const closeModal = () => {
    setShowForm(false);
    setEditingId(null);
    setFormState(EMPTY_FORM);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const salaryNum = parseFloat(formState.salary);
    if (Number.isNaN(salaryNum) || salaryNum < 0) return;

    const payload = {
      name: formState.name.trim(),
      role: formState.role.trim(),
      department: formState.department || 'Engineering',
      salary: salaryNum,
      hireDate: formState.hireDate,
    };

    if (editingId) {
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === editingId ? { ...emp, ...payload } : emp))
      );
    } else {
      setEmployees((prev) => [
        ...prev,
        { ...payload, id: Date.now().toString() },
      ]);
    }

    closeModal();
  };

  const handleEdit = (employee) => {
    setFormState({
      name: employee.name,
      role: employee.role,
      department: employee.department || 'Engineering',
      salary: String(employee.salary),
      hireDate: employee.hireDate,
    });
    setEditingId(employee.id);
    setShowForm(true);
  };

  const handleDelete = (employee) => {
    if (
      window.confirm(
        `Delete ${employee.name}? This will also remove their project allocations.`
      )
    ) {
      onDeleteEmployee(employee.id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Employees
          </h2>
          <p className="text-sm text-slate-500">
            Manage team members, compensation, and active capacity
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-violet-700"
        >
          <UserPlus size={17} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or role..."
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 outline-none focus:border-violet-500 focus:bg-white"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-violet-500"
        >
          <option value="all">All Departments</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Role
                  </label>
                  <input
                    type="text"
                    value={formState.role}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, role: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Department
                  </label>
                  <select
                    value={formState.department}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, department: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Annual Salary ($)
                  </label>
                  <input
                    type="number"
                    value={formState.salary}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, salary: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    required
                    min="0"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    value={formState.hireDate}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, hireDate: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  <Save size={16} />
                  <span>{editingId ? 'Update' : 'Save'}</span>
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {filteredEmployees.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Users className="mx-auto mb-3 text-slate-400" size={40} />
          <p className="text-sm font-semibold text-slate-700">
            {employees.length === 0
              ? 'No employees added yet'
              : 'No employees match your filters'}
          </p>
          {employees.length === 0 && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              Add your first employee
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredEmployees.map((emp) => {
            const metrics = employeeValue[emp.id] || {
              activeAllocation: 0,
              netValue: 0,
              roi: 0,
            };
            const overAllocated = metrics.activeAllocation > 100;

            return (
              <div
                key={emp.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {emp.name}
                      </h3>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {emp.department || 'Engineering'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{emp.role}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(emp)}
                      aria-label={`Edit ${emp.name}`}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-violet-600"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(emp)}
                      aria-label={`Delete ${emp.name}`}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                  <div>
                    <p className="text-slate-500">Salary/yr</p>
                    <p className="mt-0.5 font-semibold text-slate-900">
                      {formatCurrency(emp.salary)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Utilization</p>
                    <p
                      className={`mt-0.5 inline-flex items-center gap-1 font-semibold ${
                        overAllocated ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {overAllocated && <AlertTriangle size={12} />}
                      {metrics.activeAllocation}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Net Value</p>
                    <p
                      className={`mt-0.5 font-semibold ${
                        metrics.netValue >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(metrics.netValue)}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Hired {formatDate(emp.hireDate)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
