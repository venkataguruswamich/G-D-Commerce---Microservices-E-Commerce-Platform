import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
import logoFull from '../assets/brand/logo-full.png';

export default function Login() {
  useDocumentTitle('Log in');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const notify = useNotify();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(form);
      notify('Logged in successfully', 'success');
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container size="narrow" className="flex flex-col items-center py-16">
      <motion.img
        src={logoFull}
        alt="G&D Commerce"
        className="mb-8 h-auto w-full max-w-[200px] object-contain dark:brightness-125 dark:contrast-125"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      />
      <Card padding="lg" className="w-full max-w-sm">
        <h1 className="mb-6 text-h3 font-semibold text-slate-900 dark:text-white">Log in</h1>
        <form onSubmit={handleSubmit}>
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
          <FormField label="Password" id="password">
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </FormField>
          <ErrorMessage message={error} />
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-small text-slate-500 dark:text-slate-400">
          No account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Register
          </Link>
        </p>
      </Card>
    </Container>
  );
}
