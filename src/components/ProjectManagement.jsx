import React, { useMemo, useState } from 'react';
import { Briefcase, Edit2, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/finance';

const STATUS_BADGES = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  planned: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
};

const EMPTY_PROJECT = {
  name: '',
  description: '',
  totalValue: '',
  durationMonths: '',
  startDate: '',
  status: 'active',
};

const ProjectManagement = ({
  projects,
  setProjects,
  projectMetrics,
  onDeleteProject,
}) => {
  const [formState, setFormState] = useState(EMPTY_PROJECT);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const metricsById = useMemo(
    () => new Map(projectMetrics.map((m) => [m.id, m])),
    [projectMetrics]
  );

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((proj) => {
      const status = proj.status || 'active';
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (
        q &&
        !proj.name.toLowerCase().includes(q) &&
        !(proj.description || '').toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [projects, search, statusFilter]);

  const closeModal = () => {
    setShowForm(false);
    setEditingId(null);
    setFormState(EMPTY_PROJECT);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalValue = parseFloat(formState.totalValue);
    const durationMonths = parseInt(formState.durationMonths, 10);
    if (Number.isNaN(totalValue) || Number.isNaN(durationMonths) || durationMonths < 1) {
      return;
    }

    const payload = {
      name: formState.name.trim(),
      description: formState.description.trim(),
      totalValue,
      durationMonths,
      startDate: formState.startDate,
      status: formState.status || 'active',
    };

    if (editingId) {
      setProjects((prev) =>
        prev.map((proj) => (proj.id === editingId ? { ...proj, ...payload } : proj))
      );
    } else {
      setProjects((prev) => [
        ...prev,
        { ...payload, id: Date.now().toString() },
      ]);
    }

    closeModal();
  };

  const handleEdit = (project) => {
    setFormState({
      name: project.name,
      description: project.description || '',
      totalValue: String(project.totalValue),
      durationMonths: String(project.durationMonths),
      startDate: project.startDate,
      status: project.status || 'active',
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = (project) => {
    if (
      window.confirm(
        `Delete "${project.name}"? This will also remove linked employee allocations.`
      )
    ) {
      onDeleteProject(project.id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Projects
          </h2>
          <p className="text-sm text-slate-500">
            Track contract values, monthly run rates, and project margins
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-violet-700"
        >
          <Plus size={17} />
          <span>Add Project</span>
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
            placeholder="Search projects..."
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 outline-none focus:border-violet-500 focus:bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-violet-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="planned">Planned</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Project' : 'Add New Project'}
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
                  Project Name
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

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formState.description}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Total Value ($)
                  </label>
                  <input
                    type="number"
                    value={formState.totalValue}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, totalValue: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    required
                    min="0"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    value={formState.durationMonths}
                    onChange={(e) =>
                      setFormState((p) => ({
                        ...p,
                        durationMonths: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    required
                    min="1"
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
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, startDate: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Status
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, status: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500"
                  >
                    <option value="active">Active</option>
                    <option value="planned">Planned</option>
                    <option value="completed">Completed</option>
                  </select>
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

      {/* Project List */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Briefcase className="mx-auto mb-3 text-slate-400" size={40} />
          <p className="text-sm font-semibold text-slate-700">
            {projects.length === 0
              ? 'No projects added yet'
              : 'No projects match your filters'}
          </p>
          {projects.length === 0 && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              Add your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredProjects.map((project) => {
            const metrics = metricsById.get(project.id) || {
              monthlyValue: project.totalValue / Math.max(1, project.durationMonths),
              margin: 0,
              teamSize: 0,
            };
            const status = project.status || 'active';

            return (
              <div
                key={project.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {project.name}
                      </h3>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize ${
                          STATUS_BADGES[status] || STATUS_BADGES.active
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(project)}
                      aria-label={`Edit ${project.name}`}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-violet-600"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(project)}
                      aria-label={`Delete ${project.name}`}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                  <div>
                    <p className="text-slate-500">Contract</p>
                    <p className="mt-0.5 font-semibold text-slate-900">
                      {formatCurrency(project.totalValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Monthly</p>
                    <p className="mt-0.5 font-semibold text-slate-900">
                      {formatCurrency(metrics.monthlyValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Net Margin</p>
                    <p
                      className={`mt-0.5 font-semibold ${
                        metrics.margin >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(metrics.margin)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {project.durationMonths} mo &middot; Started{' '}
                    {formatDate(project.startDate)}
                  </span>
                  <span>
                    {metrics.teamSize} {metrics.teamSize === 1 ? 'member' : 'members'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
