import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotificationContext';
import FormField from '../components/FormField';
import ErrorMessage from '../components/ErrorMessage';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { extractErrorMessage } from '../utils/errors';
import useDocumentTitle from '../hooks/useDocumentTitle';
import logoHeader from '../assets/brand/logo-header.png';

export default function Register() {
  useDocumentTitle('Register');
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const notify = useNotify();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form);
      notify('Account created. Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container size="narrow" className="flex flex-col items-center py-16">
      <motion.img
        src={logoHeader}
        alt="G&D Commerce"
        className="mb-8 h-auto w-full max-w-[180px] object-contain dark:brightness-125 dark:contrast-125"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      />
      <Card padding="lg" className="w-full max-w-sm">
        <h1 className="mb-6 text-h3 font-semibold text-slate-900 dark:text-white">Create an account</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-3">
            <FormField label="First Name" id="firstName">
              <Input id="firstName" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </FormField>
            <FormField label="Last Name" id="lastName">
              <Input id="lastName" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Email" id="email">
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>
          <FormField label="Password" id="password" hint="At least 8 characters">
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </FormField>
          <ErrorMessage message={error} />
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Creating account…' : 'Register'}
          </Button>
        </form>
        <p className="mt-6 text-center text-small text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Log in
          </Link>
        </p>
      </Card>
    </Container>
  );
}
