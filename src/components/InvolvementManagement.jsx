import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Edit2,
  GitBranch,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { formatDate, getElapsedMonths } from '../utils/finance';

const EMPTY_INVOLVEMENT = {
  employeeId: '',
  projectId: '',
  startDate: '',
  endDate: '',
  allocation: '',
  role: '',
};

const InvolvementManagement = ({
  involvements,
  setInvolvements,
  employees,
  projects,
}) => {
  const [formState, setFormState] = useState(EMPTY_INVOLVEMENT);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');

  const employeeMap = useMemo(
    () => new Map(employees.map((e) => [e.id, e])),
    [employees]
  );
  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  const filteredInvolvements = useMemo(() => {
    return involvements.filter((inv) => {
      if (employeeFilter !== 'all' && inv.employeeId !== employeeFilter) return false;
      if (projectFilter !== 'all' && inv.projectId !== projectFilter) return false;
      return true;
    });
  }, [involvements, employeeFilter, projectFilter]);

  const closeModal = () => {
    setShowForm(false);
    setEditingId(null);
    setFormState(EMPTY_INVOLVEMENT);
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formState.endDate && formState.endDate < formState.startDate) {
      setFormError('End date cannot be earlier than start date.');
      return;
    }

    const allocation = parseInt(formState.allocation, 10);
    if (Number.isNaN(allocation) || allocation < 1 || allocation > 100) {
      setFormError('Allocation must be between 1% and 100%.');
      return;
    }

    const payload = {
      employeeId: formState.employeeId,
      projectId: formState.projectId,
      startDate: formState.startDate,
      endDate: formState.endDate,
      allocation,
      role: formState.role.trim(),
    };

    if (editingId) {
      setInvolvements((prev) =>
        prev.map((inv) => (inv.id === editingId ? { ...inv, ...payload } : inv))
      );
    } else {
      setInvolvements((prev) => [
        ...prev,
        { ...payload, id: Date.now().toString() },
      ]);
    }

    closeModal();
  };

  const handleEdit = (inv) => {
    setFormState({
      employeeId: inv.employeeId,
      projectId: inv.projectId,
      startDate: inv.startDate,
      endDate: inv.endDate || '',
      allocation: String(inv.allocation),
      role: inv.role,
    });
    setEditingId(inv.id);
    setFormError('');
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this project allocation?')) {
      setInvolvements((prev) => prev.filter((inv) => inv.id !== id));
    }
  };

  const prerequisitesMissing = employees.length === 0 || projects.length === 0;

  const selectedEmpAllocation = useMemo(() => {
    if (!formState.employeeId) return null;
    return involvements
      .filter((inv) => inv.employeeId === formState.employeeId && inv.id !== editingId)
      .reduce((sum, inv) => sum + (Number(inv.allocation) || 0), 0);
  }, [involvements, formState.employeeId, editingId]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Project Allocations
          </h2>
          <p className="text-sm text-slate-500">
            Assign employees to projects with time-bounded allocation percentages
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          disabled={prerequisitesMissing}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Plus size={17} />
          <span>Add Allocation</span>
        </button>
      </div>

      {prerequisitesMissing && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Calendar size={18} className="shrink-0 text-amber-600" />
          <span>
            Add at least one employee and one project before creating allocations.
          </span>
        </div>
      )}

      {/* Filters */}
      {involvements.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-violet-500"
          >
            <option value="all">All Employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-violet-500"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Allocation' : 'New Project Allocation'}
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
                  Employee
                </label>
                <select
                  value={formState.employeeId}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, employeeId: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
                {selectedEmpAllocation !== null && (
                  <p
                    className={`mt-1 text-xs font-medium ${
                      selectedEmpAllocation + (Number(formState.allocation) || 0) > 100
                        ? 'text-rose-600'
                        : 'text-slate-500'
                    }`}
                  >
                    Existing allocation: {selectedEmpAllocation}% &middot; Remaining
                    capacity: {Math.max(0, 100 - selectedEmpAllocation)}%
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Project
                </label>
                <select
                  value={formState.projectId}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, projectId: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Project Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Tech Lead"
                    value={formState.role}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, role: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Allocation (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formState.allocation}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, allocation: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-violet-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formState.startDate}
                    onChange={(e) => {
                      setFormState((p) => ({ ...p, startDate: e.target.value }));
                      if (formError) setFormError('');
                    }}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formState.endDate}
                    onChange={(e) => {
                      setFormState((p) => ({ ...p, endDate: e.target.value }));
                      if (formError) setFormError('');
                    }}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {formError && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                  <AlertTriangle size={14} />
                  <span>{formError}</span>
                </p>
              )}

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
      {filteredInvolvements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <GitBranch className="mx-auto mb-3 text-slate-400" size={40} />
          <p className="text-sm font-semibold text-slate-700">
            {involvements.length === 0
              ? 'No allocations recorded yet'
              : 'No allocations match your filters'}
          </p>
          {involvements.length === 0 && !prerequisitesMissing && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              Create your first allocation
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvolvements.map((inv) => {
            const emp = employeeMap.get(inv.employeeId);
            const proj = projectMap.get(inv.projectId);
            const months = getElapsedMonths(inv.startDate, inv.endDate);

            return (
              <div
                key={inv.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-slate-900">
                      {emp ? emp.name : 'Unknown Employee'}
                    </span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="text-base font-bold text-violet-600">
                      {proj ? proj.name : 'Unknown Project'}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {inv.allocation}%
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-600">
                    {inv.role} &middot; {formatDate(inv.startDate)} to{' '}
                    {formatDate(inv.endDate)} ({months.toFixed(1)} mo elapsed)
                  </p>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleEdit(inv)}
                    aria-label="Edit allocation"
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-violet-600"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(inv.id)}
                    aria-label="Delete allocation"
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InvolvementManagement;
