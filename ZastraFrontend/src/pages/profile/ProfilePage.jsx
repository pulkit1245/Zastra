import { useEffect, useState } from 'react';
import { UserCircle, Save, Plus, X } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useApi } from '../../hooks/useApi';
import { profileService } from '../../services/profileService';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const profile = useApi(profileService.getProfile);
  const [form, setForm] = useState({ displayName: '', bio: '', targetRoles: [] });
  const [roleInput, setRoleInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profile.execute();
  }, []);

  // Sync fetched profile data into editable form state
  useEffect(() => {
    if (profile.data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        displayName: profile.data.displayName || '',
        bio: profile.data.bio || '',
        targetRoles: profile.data.targetRoles || [],
      });
    }
  }, [profile.data]);

  const addRole = () => {
    if (roleInput.trim() && !form.targetRoles.includes(roleInput.trim())) {
      setForm({ ...form, targetRoles: [...form.targetRoles, roleInput.trim()] });
      setRoleInput('');
    }
  };

  const removeRole = (role) => {
    setForm({ ...form, targetRoles: form.targetRoles.filter((r) => r !== role) });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileService.updateProfile(form);
      toast.success('Profile updated successfully');
      profile.execute();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (profile.loading && !profile.data) return <LoadingSpinner text="Loading profile…" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Profile</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Customize your developer identity.</p>
      </div>

      <form onSubmit={handleSave} className="glass-card p-6 space-y-5">
        {/* Avatar placeholder */}
        <div className="flex items-center gap-4 pb-5 border-b border-surface-200/60 dark:border-surface-700/40">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/20">
            <UserCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="font-semibold text-surface-900 dark:text-surface-100">
              {form.displayName || 'Your Name'}
            </p>
            <p className="text-sm text-surface-500 dark:text-surface-400">Developer</p>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            className="input-field"
            placeholder="John Doe"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="input-field min-h-[100px] resize-y"
            placeholder="Tell the world about yourself..."
            rows={4}
          />
        </div>

        {/* Target Roles */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Target Roles
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
              className="input-field flex-1"
              placeholder="e.g. Frontend Developer"
            />
            <button type="button" onClick={addRole} className="btn-secondary px-3">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {form.targetRoles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.targetRoles.map((role) => (
                <span
                  key={role}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium"
                >
                  {role}
                  <button type="button" onClick={() => removeRole(role)} className="hover:text-danger-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2">
          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
