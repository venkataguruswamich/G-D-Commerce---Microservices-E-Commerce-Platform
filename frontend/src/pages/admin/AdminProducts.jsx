import React, { useEffect, useState } from 'react';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import Container from '../../components/ui/Container';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { useNotify } from '../../context/NotificationContext';
import { listProducts, createProduct, updateProduct, deleteProduct, updateInventory, getInventory } from '../../api/products';
import { listCategories } from '../../api/categories';
import { formatMoney } from '../../utils/format';
import { extractErrorMessage } from '../../utils/errors';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const EMPTY_FORM = { sku: '', name: '', description: '', priceCents: 0, categoryId: '', imageUrl: '' };

export default function AdminProducts() {
  useDocumentTitle('Manage Products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState({});
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
    listProducts({ limit: 50 })
      .then(async (data) => {
        setProducts(data.items);
        const entries = await Promise.all(
          data.items.map((product) =>
            getInventory(product.id)
              .then((inv) => [product.id, inv.quantity])
              .catch(() => [product.id, 0])
          )
        );
        setInventory(Object.fromEntries(entries));
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    listCategories().then(setCategories).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      priceCents: product.priceCents,
      categoryId: product.categoryId || '',
      imageUrl: product.imageUrl || '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editingId) {
        await updateProduct(editingId, { ...form, categoryId: form.categoryId || null });
        notify('Product updated', 'success');
      } else {
        await createProduct({ ...form, categoryId: form.categoryId || null });
        notify('Product created', 'success');
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
      await deleteProduct(deleteTarget.id);
      notify('Product deleted', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleInventoryChange = async (id, quantity) => {
    try {
      await updateInventory(id, { quantity });
      setInventory((prev) => ({ ...prev, [id]: quantity }));
      notify('Inventory updated', 'success');
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    }
  };

  if (loading) return <Loading />;

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h2 font-semibold text-slate-900 dark:text-white">Manage Products</h1>
        <Button onClick={openCreate}>+ New Product</Button>
      </div>
      <ErrorMessage message={error} onRetry={load} />

      <Card padding="none" className="overflow-x-auto">
        <table className="w-full text-left text-small">
          <thead>
            <tr className="border-b border-slate-200 text-caption uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Inventory</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{product.sku}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{product.name}</td>
                <td className="px-4 py-3">{formatMoney(product.priceCents, product.currency)}</td>
                <td className="px-4 py-3">
                  <Input
                    key={`${product.id}-${inventory[product.id] ?? 0}`}
                    type="number"
                    min={0}
                    defaultValue={inventory[product.id] ?? 0}
                    className="w-20"
                    aria-label={`Inventory for ${product.name}`}
                    onBlur={(e) => handleInventoryChange(product.id, parseInt(e.target.value, 10) || 0)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(product)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleteTarget(product)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal title={editingId ? 'Edit Product' : 'New Product'} isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave}>
          <FormField label="SKU" id="sku">
            <Input id="sku" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </FormField>
          <FormField label="Name" id="name">
            <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Description" id="description">
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <FormField label="Price (cents)" id="priceCents">
            <Input
              id="priceCents"
              type="number"
              min={0}
              required
              value={form.priceCents}
              onChange={(e) => setForm({ ...form, priceCents: parseInt(e.target.value, 10) || 0 })}
            />
          </FormField>
          <FormField label="Category" id="categoryId">
            <Select id="categoryId" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Image URL" id="imageUrl">
            <Input id="imageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </FormField>
          <ErrorMessage message={formError} />
          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete product"
        message={`Delete "${deleteTarget?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Container>
  );
}
