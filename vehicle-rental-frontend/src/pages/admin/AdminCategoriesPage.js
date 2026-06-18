import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminCategoryApi } from '../../api/endpoints';
import AdminSectionNav from '../../components/admin/AdminSectionNav';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import { formatDate, getApiError, getStatusTone } from '../../utils/format';

const emptyForm = {
  name: '',
  description: '',
  icon: '',
  isActive: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState('');
  const [error, setError] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const loadCategories = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminCategoryApi.list();
      setCategories(response.data?.data?.categories || []);
    } catch (apiError) {
      setError(getApiError(apiError, 'We could not load admin categories.'));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData(emptyForm);
    setEditorOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      icon: category.icon || '',
      isActive: Boolean(category.isActive),
    });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingCategory(null);
    setFormData(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (editingCategory) {
        await adminCategoryApi.update(editingCategory._id, formData);
        toast.success('Category updated.');
      } else {
        await adminCategoryApi.create(formData);
        toast.success('Category created.');
      }

      closeEditor();
      loadCategories();
    } catch (apiError) {
      toast.error(getApiError(apiError, 'We could not save this category.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    setCategoryToDelete(category);
  };

  const closeDeleteModal = () => {
    if (processingId) return;
    setCategoryToDelete(null);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) {
      return;
    }

    setProcessingId(categoryToDelete._id);

    try {
      await adminCategoryApi.remove(categoryToDelete._id);
      toast.success('Category deleted.');
      setCategoryToDelete(null);
      loadCategories();
    } catch (apiError) {
      toast.error(getApiError(apiError, 'We could not delete this category.'));
    } finally {
      setProcessingId('');
    }
  };

  const activeCount = categories.filter((item) => item.isActive).length;

  return (
    <div className="page-container page-container--admin">
      <div className="page-header page-header--admin">
        <span className="page-eyebrow">Catalog structure</span>
        <h1>Category Management</h1>
        <p>Maintain the catalog taxonomy used across vehicle listings and search filters.</p>
      </div>

      <AdminSectionNav />

      <div className="card admin-toolbar-card">
        <div className="row-between">
          <div className="section-heading__content">
            <h3 style={{ marginBottom: '0.3rem' }}>Category Overview</h3>
            <p className="muted-text">{activeCount} active / {categories.length - activeCount} inactive</p>
          </div>
          <div className="admin-toolbar__actions">
            <button type="button" className="button button--ghost" onClick={loadCategories}>
              Refresh
            </button>
            <button type="button" className="button button--primary" onClick={openCreateModal}>
              Add category
            </button>
          </div>
        </div>
      </div>

      {loading ? <Spinner label="Loading admin categories..." /> : null}
      {error ? <ErrorState title="Categories unavailable" description={error} /> : null}

      {!loading && !error && categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create your first category so hosts can organize their inventory."
        />
      ) : null}

      {!loading && !error && categories.length > 0 ? (
        <div className="card">
          <div className="admin-table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Icon</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td style={{ fontWeight: 700 }}>{category.name}</td>
                    <td>{category.description || 'No description provided'}</td>
                    <td>{category.icon || 'None'}</td>
                    <td>
                      <span className={`badge badge-${getStatusTone(category.isActive ? 'active' : 'inactive')}`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{formatDate(category.updatedAt || category.createdAt)}</td>
                    <td>
                      <div className="inline-actions flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center text-sky-300 transition-colors hover:text-sky-200"
                          onClick={() => openEditModal(category)}
                          aria-label="Edit category"
                          title="Edit"
                        >
                          <Pencil size={18} strokeWidth={2.25} />
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center text-rose-300 transition-colors hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
                          onClick={() => handleDelete(category)}
                          disabled={processingId === category._id}
                          aria-label="Delete category"
                          title="Delete"
                        >
                          <Trash2 size={18} strokeWidth={2.25} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <Modal
        open={editorOpen}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        onClose={closeEditor}
        actions={(
          <>
            <button type="button" className="button button--ghost" onClick={closeEditor} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" form="category-editor-form" className="button button--primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingCategory ? 'Save changes' : 'Create category'}
            </button>
          </>
        )}
      >
        <form id="category-editor-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <label className="field">
            <span>Name</span>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="SUV, Sedan, Luxury..."
              required
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short description used by admins and hosts"
              rows={4}
            />
          </label>

          <label className="field">
            <span>Icon</span>
            <input
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="Optional icon name or URL"
            />
          </label>

          <label className="admin-checkbox">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <span>Category is active for new listings</span>
          </label>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(categoryToDelete)}
        title="Delete Category"
        message={categoryToDelete ? `Delete ${categoryToDelete.name}?` : ''}
        confirmLabel="Delete category"
        confirmTone="danger"
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        disabled={Boolean(processingId)}
      />
    </div>
  );
}
