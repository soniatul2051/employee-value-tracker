import React, { useState } from 'react';
import { Briefcase, Edit2, Trash2, X, Save, Plus } from 'lucide-react';

const ProjectManagement = ({ projects, setProjects }) => {
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    totalValue: '',
    durationMonths: '',
    startDate: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setProjects(prev => prev.map(proj => 
        proj.id === editingId ? { 
          ...newProject, 
          id: editingId,
          totalValue: parseFloat(newProject.totalValue),
          durationMonths: parseInt(newProject.durationMonths)
        } : proj
      ));
    } else {
      setProjects(prev => [
        ...prev,
        {
          ...newProject,
          id: Date.now().toString(),
          totalValue: parseFloat(newProject.totalValue),
          durationMonths: parseInt(newProject.durationMonths)
        }
      ]);
    }
    
    setNewProject({ name: '', description: '', totalValue: '', durationMonths: '', startDate: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (project) => {
    setNewProject({
      name: project.name,
      description: project.description,
      totalValue: project.totalValue,
      durationMonths: project.durationMonths,
      startDate: project.startDate
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter(proj => proj.id !== id));
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Project Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          <span>Add Project</span>
        </button>
      </div>

     
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editingId ? 'Edit Project' : 'Add New Project'}
              </h3>
              <button onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setNewProject({ name: '', description: '', totalValue: '', durationMonths: '', startDate: '' });
              }}>
                <X className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  name="name"
                  value={newProject.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={newProject.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Project Value ($)</label>
                <input
                  type="number"
                  name="totalValue"
                  value={newProject.totalValue}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months)</label>
                <input
                  type="number"
                  name="durationMonths"
                  value={newProject.durationMonths}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={newProject.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingId ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setNewProject({ name: '', description: '', totalValue: '', durationMonths: '', startDate: '' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Briefcase className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500">No projects added yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Add your first project
            </button>
          </div>
        ) : (
          projects.map(project => (
            <div
              key={project.id}
              className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{project.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <p className="text-sm">
                      <span className="text-gray-500">Value:</span>{' '}
                      <span className="font-medium">{formatCurrency(project.totalValue)}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Duration:</span>{' '}
                      <span className="font-medium">{project.durationMonths} months</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Monthly Value:</span>{' '}
                      <span className="font-medium">{formatCurrency(project.totalValue / project.durationMonths)}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Start Date:</span>{' '}
                      <span className="font-medium">{new Date(project.startDate).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;