import React, { useState } from 'react';
import { Link2, Edit2, Trash2, X, Save, Plus, Calendar } from 'lucide-react';

const InvolvementManagement = ({ involvements, setInvolvements, employees, projects }) => {
  const [newInvolvement, setNewInvolvement] = useState({
    employeeId: '',
    projectId: '',
    startDate: '',
    endDate: '',
    allocation: '',
    role: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInvolvement(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setInvolvements(prev => prev.map(inv => 
        inv.id === editingId ? { 
          ...newInvolvement, 
          id: editingId,
          allocation: parseInt(newInvolvement.allocation)
        } : inv
      ));
    } else {
      setInvolvements(prev => [
        ...prev,
        {
          ...newInvolvement,
          id: Date.now().toString(),
          allocation: parseInt(newInvolvement.allocation)
        }
      ]);
    }
    
    setNewInvolvement({
      employeeId: '',
      projectId: '',
      startDate: '',
      endDate: '',
      allocation: '',
      role: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (involvement) => {
    setNewInvolvement({
      employeeId: involvement.employeeId,
      projectId: involvement.projectId,
      startDate: involvement.startDate,
      endDate: involvement.endDate || '',
      allocation: involvement.allocation,
      role: involvement.role
    });
    setEditingId(involvement.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this involvement?')) {
      setInvolvements(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.name : 'Unknown';
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown';
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const months = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30));
    return months;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Project Involvement</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          disabled={employees.length === 0 || projects.length === 0}
        >
          <Plus size={18} />
          <span>Add Involvement</span>
        </button>
      </div>

      {/* Warning if no employees or projects */}
      {(employees.length === 0 || projects.length === 0) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Calendar className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You need to add{' '}
                {employees.length === 0 && 'employees'}
                {employees.length === 0 && projects.length === 0 && ' and '}
                {projects.length === 0 && 'projects'}
                {' '}before adding involvements.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editingId ? 'Edit Involvement' : 'Add New Involvement'}
              </h3>
              <button onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setNewInvolvement({
                  employeeId: '',
                  projectId: '',
                  startDate: '',
                  endDate: '',
                  allocation: '',
                  role: ''
                });
              }}>
                <X className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  name="employeeId"
                  value={newInvolvement.employeeId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  name="projectId"
                  value={newInvolvement.projectId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role in Project</label>
                <input
                  type="text"
                  name="role"
                  value={newInvolvement.role}
                  onChange={handleInputChange}
                  placeholder="e.g., Developer, Manager, Designer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allocation (%)</label>
                <input
                  type="number"
                  name="allocation"
                  value={newInvolvement.allocation}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={newInvolvement.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={newInvolvement.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank if ongoing</p>
                </div>
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
                    setNewInvolvement({
                      employeeId: '',
                      projectId: '',
                      startDate: '',
                      endDate: '',
                      allocation: '',
                      role: ''
                    });
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

      {/* Involvement List */}
      <div className="space-y-3">
        {involvements.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Link2 className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500">No involvements recorded yet</p>
            <button
              onClick={() => setShowForm(true)}
              disabled={employees.length === 0 || projects.length === 0}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Add your first involvement
            </button>
          </div>
        ) : (
          involvements.map(involvement => {
            const duration = calculateDuration(involvement.startDate, involvement.endDate);
            
            return (
              <div
                key={involvement.id}
                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">
                        {getEmployeeName(involvement.employeeId)}
                      </h3>
                      <span className="text-gray-400">→</span>
                      <h3 className="font-semibold text-blue-600">
                        {getProjectName(involvement.projectId)}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">{involvement.role}</p>
                    
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <p className="text-sm">
                        <span className="text-gray-500">Allocation:</span>{' '}
                        <span className="font-medium">{involvement.allocation}%</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">Duration:</span>{' '}
                        <span className="font-medium">{duration} months</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">Start:</span>{' '}
                        <span className="font-medium">{new Date(involvement.startDate).toLocaleDateString()}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-500">End:</span>{' '}
                        <span className="font-medium">
                          {involvement.endDate ? new Date(involvement.endDate).toLocaleDateString() : 'Present'}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(involvement)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(involvement.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Statistics */}
      {involvements.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Total Involvements</p>
            <p className="text-2xl font-bold text-blue-700">{involvements.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Active Employees</p>
            <p className="text-2xl font-bold text-green-700">
              {new Set(involvements.map(i => i.employeeId)).size}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Active Projects</p>
            <p className="text-2xl font-bold text-purple-700">
              {new Set(involvements.map(i => i.projectId)).size}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvolvementManagement;