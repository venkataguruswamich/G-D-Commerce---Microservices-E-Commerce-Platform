import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotificationContext';
import FormField from '../components/FormField';
import ErrorMessage from '../components/ErrorMessage';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { updateMe } from '../api/auth';
import { extractErrorMessage } from '../utils/errors';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Profile() {
  useDocumentTitle('Profile');
  const { user } = useAuth();
  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const notify = useNotify();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const updated = await updateMe(form);
      localStorage.setItem('user', JSON.stringify(updated));
      notify('Profile updated', 'success');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container size="narrow" className="py-16">
      <Card padding="lg" className="mx-auto w-full max-w-md">
        <h1 className="mb-6 text-h3 font-semibold text-slate-900 dark:text-white">Profile</h1>
        <form onSubmit={handleSubmit}>
          <FormField label="Email" id="email" hint="Email can't be changed">
            <Input id="email" value={user.email} disabled />
          </FormField>
          <FormField label="First Name" id="firstName">
            <Input id="firstName" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </FormField>
          <FormField label="Last Name" id="lastName">
            <Input id="lastName" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </FormField>
          <ErrorMessage message={error} />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </form>
      </Card>
    </Container>
  );
}
