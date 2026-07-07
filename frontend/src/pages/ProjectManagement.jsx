import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Briefcase, Plus, Trash2, Edit2, Check, X, AlertCircle } from 'lucide-react';

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await api.projects.getAll();
      setProjects(data);
    } catch (e) {
      setError('Failed to fetch projects');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setSuccess('');
    try {
      await api.projects.create(name, description);
      setName('');
      setDescription('');
      setSuccess('Project created successfully!');
      fetchProjects();
    } catch (e) {
      setError(e.message || 'Failed to create project');
    }
  };

  const handleStartEdit = (proj) => {
    setEditingId(proj.id);
    setEditName(proj.name);
    setEditDescription(proj.description || '');
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    setError('');
    setSuccess('');
    try {
      await api.projects.update(id, editName, editDescription);
      setEditingId(null);
      setSuccess('Project updated successfully!');
      fetchProjects();
    } catch (e) {
      setError(e.message || 'Failed to update project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This could affect reports associated with it.')) return;
    setError('');
    setSuccess('');
    try {
      await api.projects.delete(id);
      setSuccess('Project deleted successfully!');
      fetchProjects();
    } catch (e) {
      setError(e.message || 'Failed to delete project');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-display flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-450" />
          Project Management
        </h1>
        <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
          Create, edit, and delete projects or categories team members can attach to their reports.
        </p>
      </div>

      {/* Alerts */}
      {(error || success) && (
        <div className={`p-4 rounded-2xl text-xs flex items-start gap-2 border ${
          error 
            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400' 
            : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400'
        }`}>
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error || success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create Form */}
        <section className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-850 dark:text-slate-100 mb-4">
              Add New Project
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-655 dark:text-slate-400 uppercase tracking-wider">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Client Alpha, R&D"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-655 dark:text-slate-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional brief description of this work category..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-md transition-all duration-205 focus:outline-none"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Create Project</span>
              </button>
            </form>
          </div>
        </section>

        {/* Right Columns: Projects List */}
        <section className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-850 dark:text-slate-100">
              Active Projects / Categories ({projects.length})
            </h2>

            {projects.length === 0 ? (
              <div className="text-center py-12 text-slate-450 dark:text-slate-550 text-sm">
                No projects defined yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-850 space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="pt-4 first:pt-0 flex items-start justify-between gap-4 group">
                    {editingId === proj.id ? (
                      /* Inline Editing View */
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full max-w-sm px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none"
                        />
                        <textarea
                          rows={2}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm text-slate-800 dark:text-slate-100 outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(proj.id)}
                            className="p-1 bg-green-100 dark:bg-green-950/45 text-green-700 dark:text-green-400 rounded-lg hover:scale-105 transition"
                            title="Save"
                          >
                            <Check className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-lg hover:scale-105 transition"
                            title="Cancel"
                          >
                            <X className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Read-Only Row View */
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-150 text-sm">
                          {proj.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {proj.description || 'No description provided.'}
                        </p>
                      </div>
                    )}

                    {editingId !== proj.id && (
                      <div className="flex items-center gap-1.5 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={() => handleStartEdit(proj)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl transition"
                          title="Edit Project"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 hover:text-red-650 dark:hover:text-red-400 rounded-xl transition"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
