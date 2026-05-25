import { ImagePlus, Loader2, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { fileToDataUrl } from '../utils/fileToDataUrl';
import { getErrorMessage } from '../utils/getErrorMessage';

const EditProfile = () => {
  const { refreshProfile, setUser, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', bio: '', profilePicture: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const profile = user || (await refreshProfile());
        setForm({
          username: profile.username || '',
          email: profile.email || '',
          bio: profile.bio || '',
          profilePicture: profile.profilePicture || ''
        });
      } catch (error) {
        toast.error(getErrorMessage(error, 'Unable to load profile'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [refreshProfile, user]);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const profilePicture = await fileToDataUrl(file, 2);
      setForm((state) => ({ ...state, profilePicture }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const { data } = await api.put('/users/profile', form);
      setUser(data);
      toast.success('Profile updated');
      navigate('/profile');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update profile'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading settings" />;

  return (
    <div className="mx-auto max-w-2xl">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-black text-ink">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="flex flex-wrap items-end gap-4">
            <Avatar user={form} size="xl" />
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
                <ImagePlus className="h-4 w-4 text-leaf" aria-hidden="true" />
                Photo
                <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
              </label>
              {form.profilePicture ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm((state) => ({ ...state, profilePicture: '' }))}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Remove
                </Button>
              ) : null}
            </div>
          </div>

          <label className="block text-sm font-bold text-slate-700">
            Username
            <input
              required
              minLength={3}
              maxLength={32}
              value={form.username}
              onChange={(event) => setForm((state) => ({ ...state, username: event.target.value }))}
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-normal focus:border-ocean focus:bg-white"
            />
          </label>

          <label className="block text-sm font-bold text-slate-700">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-normal focus:border-ocean focus:bg-white"
            />
          </label>

          <label className="block text-sm font-bold text-slate-700">
            Bio
            <textarea
              maxLength={180}
              rows={4}
              value={form.bio}
              onChange={(event) => setForm((state) => ({ ...state, bio: event.target.value }))}
              className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-normal focus:border-ocean focus:bg-white"
            />
          </label>

          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            Save Changes
          </Button>
        </form>
      </section>
    </div>
  );
};

export default EditProfile;
