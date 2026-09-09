import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotify } from '../../context/NotificationContext';
import FormField from '../../components/FormField';
import ErrorMessage from '../../components/ErrorMessage';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { updateMe } from '../../api/auth';
import { extractErrorMessage } from '../../utils/errors';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const TWOFA_STORAGE_KEY = 'demo2faEnabled';

export default function AccountProfile() {
  useDocumentTitle('Profile & Security');
  const { user } = useAuth();
  const notify = useNotify();

  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName });
  const [profileError, setProfileError] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });

  const [twoFaEnabled, setTwoFaEnabled] = useState(() => {
    try {
      return localStorage.getItem(TWOFA_STORAGE_KEY) === 'true';
    } catch (err) {
      return false;
    }
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError(null);
    setSavingProfile(true);
    try {
      const updated = await updateMe(form);
      localStorage.setItem('user', JSON.stringify(updated));
      notify('Profile updated', 'success');
    } catch (err) {
      setProfileError(extractErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // The user-service has no password-change endpoint — showing a fake
    // success here would be worse than being upfront that this isn't wired
    // up in this environment yet.
    notify("Password changes aren't available in this demo environment yet.", 'info');
    setPasswordForm({ current: '', next: '', confirm: '' });
  };

  const toggleTwoFa = () => {
    const next = !twoFaEnabled;
    setTwoFaEnabled(next);
    try {
      localStorage.setItem(TWOFA_STORAGE_KEY, String(next));
    } catch (err) {
      // localStorage unavailable — the toggle still works for this session.
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card padding="lg">
        <h2 className="mb-4 text-h4 font-semibold text-slate-900 dark:text-white">Profile</h2>
        <form onSubmit={handleProfileSubmit}>
          <FormField label="Email" id="email" hint="Email can't be changed">
            <Input id="email" value={user.email} disabled />
          </FormField>
          <FormField label="First Name" id="firstName">
            <Input id="firstName" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </FormField>
          <FormField label="Last Name" id="lastName">
            <Input id="lastName" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </FormField>
          <ErrorMessage message={profileError} />
          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? 'Saving…' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      <Card padding="lg">
        <h2 className="mb-1 text-h4 font-semibold text-slate-900 dark:text-white">Password</h2>
        <p className="mb-4 text-caption text-slate-500 dark:text-slate-400">
          Not available in this demo environment — the form below doesn&apos;t change anything yet.
        </p>
        <form onSubmit={handlePasswordSubmit}>
          <FormField label="Current password" id="current-password">
            <Input
              id="current-password"
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
            />
          </FormField>
          <FormField label="New password" id="next-password">
            <Input
              id="next-password"
              type="password"
              value={passwordForm.next}
              onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
            />
          </FormField>
          <FormField label="Confirm new password" id="confirm-password">
            <Input
              id="confirm-password"
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
            />
          </FormField>
          <Button type="submit" variant="secondary">
            Update Password
          </Button>
        </form>
      </Card>

      <Card padding="lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-h4 font-semibold text-slate-900 dark:text-white">Two-Factor Authentication</h2>
            <p className="mt-1 max-w-md text-caption text-slate-500 dark:text-slate-400">
              Demo setting — not connected to a real authentication factor.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={twoFaEnabled}
            onClick={toggleTwoFa}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${twoFaEnabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                twoFaEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </Card>
    </div>
  );
}
