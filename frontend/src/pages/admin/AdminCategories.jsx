import React, { useEffect, useState } from 'react';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import Container from '../../components/ui/Container';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Input, Textarea } from '../../components/ui/Input';
import { useNotify } from '../../context/NotificationContext';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import { extractErrorMessage } from '../../utils/errors';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const EMPTY_FORM = { name: '', slug: '', description: '' };

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function AdminCategories() {
  useDocumentTitle('Manage Categories');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const notify = useNotify();

  const load = () => {
    setLoading(true);
    listCategories()
      .then(setCategories)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name, slug: category.slug, description: category.description || '' });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editingId) {
        await updateCategory(editingId, form);
        notify('Category updated', 'success');
      } else {
        await createCategory(form);
        notify('Category created', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      notify('Category deleted', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h2 font-semibold text-slate-900 dark:text-white">Manage Categories</h1>
        <Button onClick={openCreate}>+ New Category</Button>
      </div>
      <ErrorMessage message={error} onRetry={load} />

      <Card padding="none" className="overflow-x-auto">
        <table className="w-full text-left text-small">
          <thead>
            <tr className="border-b border-slate-200 text-caption uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{category.name}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{category.slug}</td>
                <td className="max-w-xs truncate px-4 py-3 text-slate-500 dark:text-slate-400">{category.description}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(category)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleteTarget(category)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal title={editingId ? 'Edit Category' : 'New Category'} isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave}>
          <FormField label="Name" id="name">
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((prev) => ({ ...prev, name, slug: editingId ? prev.slug : slugify(name) }));
              }}
            />
          </FormField>
          <FormField label="Slug" id="slug" hint="Lowercase letters, numbers, and hyphens only">
            <Input
              id="slug"
              required
              pattern="[a-z0-9-]+"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </FormField>
          <FormField label="Description" id="description">
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <ErrorMessage message={formError} />
          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete category"
        message={`Delete "${deleteTarget?.name}"? Products in this category will keep their existing assignment removed.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Container>
  );
}
