import { useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, ExternalLink, X, FolderKanban,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useApi } from '../../hooks/useApi';
import { projectService } from '../../services/projectService';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const emptyProject = { title: '', description: '', techStack: '', link: '' };

export default function ProjectsPage() {
  const projects = useApi(projectService.getProjects);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    projects.execute();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyProject);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description || '',
      techStack: (p.techStack || []).join(', '),
      link: p.link || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        techStack: form.techStack ? form.techStack.split(',').map((s) => s.trim()).filter(Boolean) : [],
        link: form.link || null,
      };

      if (editingId) {
        await projectService.updateProject(editingId, payload);
        toast.success('Project updated');
      } else {
        await projectService.createProject(payload);
        toast.success('Project created');
      }
      setModalOpen(false);
      projects.execute();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await projectService.deleteProject(deleteTarget);
      toast.success('Project deleted');
      setDeleteTarget(null);
      projects.execute();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  if (projects.loading && !projects.data) return <LoadingSpinner text="Loading projects…" />;

  const list = projects.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Projects</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Showcase your best work.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Project Cards */}
      {list.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Add your projects to showcase them on your portfolio."
          action={
            <button onClick={openCreate} className="btn-primary">
              <Plus className="w-4 h-4" /> Create First Project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((project) => (
            <div key={project.id} className="glass-card p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 line-clamp-1">
                  {project.title}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <button
                    onClick={() => openEdit(project)}
                    className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 text-surface-400 hover:text-primary-500" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(project.id)}
                    className="p-1.5 rounded-lg hover:bg-danger-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-surface-400 hover:text-danger-500" />
                  </button>
                </div>
              </div>

              {project.description && (
                <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 mb-3">
                  {project.description}
                </p>
              )}

              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md text-xs font-medium bg-primary-500/10 text-primary-600 dark:text-primary-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-3 border-t border-surface-200/60 dark:border-surface-700/40 flex items-center justify-between">
                <span className="text-xs text-surface-400 dark:text-surface-500">
                  {formatDate(project.createdAt)}
                </span>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-400 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative glass-card p-6 w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">
                {editingId ? 'Edit Project' : 'New Project'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field"
                  placeholder="My Awesome Project"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field min-h-[80px] resize-y"
                  placeholder="A brief description of the project..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Tech Stack
                </label>
                <input
                  type="text"
                  value={form.techStack}
                  onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                  className="input-field"
                  placeholder="React, Node.js, PostgreSQL"
                />
                <p className="text-xs text-surface-400 mt-1">Comma-separated list</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Link
                </label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="input-field"
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
