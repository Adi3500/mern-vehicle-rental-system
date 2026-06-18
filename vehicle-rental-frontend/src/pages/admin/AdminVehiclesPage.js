import { useEffect, useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { adminCategoryApi, adminVehicleApi } from '../../api/endpoints';
import AdminSectionNav from '../../components/admin/AdminSectionNav';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, getApiError, getPrimaryImage, getStatusTone } from '../../utils/format';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState('');
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [error, setError] = useState('');

  const loadVehicles = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminVehicleApi.list({
        status: status || undefined,
        category: category || undefined,
        page,
        limit: 8,
      });

      setVehicles(response.data?.data || []);
      setPagination(response.data?.pagination || null);
    } catch (apiError) {
      setError(getApiError(apiError, 'We could not load admin vehicles.'));
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await adminCategoryApi.list();
        setCategories(response.data?.data?.categories || []);
      } catch {
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await adminVehicleApi.list({
          status: status || undefined,
          category: category || undefined,
          page,
          limit: 8,
        });

        setVehicles(response.data?.data || []);
        setPagination(response.data?.pagination || null);
      } catch (apiError) {
        setError(getApiError(apiError, 'We could not load admin vehicles.'));
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [page, status, category]);

  const handleDelete = async (vehicle) => {
    setVehicleToDelete(vehicle);
  };

  const closeDeleteModal = () => {
    if (processingId) return;
    setVehicleToDelete(null);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) {
      return;
    }

    setProcessingId(vehicleToDelete._id);

    try {
      await adminVehicleApi.remove(vehicleToDelete._id);
      toast.success('Vehicle removed.');
      setVehicleToDelete(null);
      loadVehicles();
    } catch (apiError) {
      toast.error(getApiError(apiError, 'We could not remove this vehicle.'));
    } finally {
      setProcessingId('');
    }
  };

  return (
    <div className="page-container page-container--admin">
      <div className="page-header page-header--admin">
        <span className="page-eyebrow">Inventory oversight</span>
        <h1>Vehicle Management</h1>
        <p>Audit listings across all hosts and quickly remove inventory that should not stay public.</p>
      </div>

      <AdminSectionNav />

      <div className="card admin-toolbar-card">
        <div className="admin-toolbar">
          <label className="field" style={{ minWidth: '220px' }}>
            <span>Status</span>
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending_review">Pending review</option>
            </select>
          </label>

          <label className="field" style={{ minWidth: '220px' }}>
            <span>Category</span>
            <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
          </label>

          <div className="admin-toolbar__actions">
            <button type="button" className="button button--ghost" onClick={loadVehicles}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? <Spinner label="Loading admin vehicles..." /> : null}
      {error ? <ErrorState title="Vehicles unavailable" description={error} /> : null}

      {!loading && !error && vehicles.length === 0 ? (
        <EmptyState
          title="No vehicles found"
          description="Try broadening the filters or check back after hosts publish more listings."
        />
      ) : null}

      {!loading && !error && vehicles.length > 0 ? (
        <>
          <div className="vehicles-grid">
            {vehicles.map((vehicle) => (
              <article key={vehicle._id} className="card admin-entity-card">
                <img
                  src={getPrimaryImage(vehicle.images)}
                  alt={vehicle.title}
                  className="admin-entity-card__media"
                />
                <div className="admin-entity-card__body">
                  <div className="admin-entity-card__top">
                    <div>
                      <h3>{vehicle.title}</h3>
                      <p className="muted-text">{vehicle.location?.city}, {vehicle.location?.country}</p>
                    </div>
                    <span className={`badge badge-${getStatusTone(vehicle.status)}`}>{vehicle.status}</span>
                  </div>
                  <p className="admin-entity-card__price">{formatCurrency(vehicle.pricePerDay)} / day</p>
                  <div className="admin-entity-card__meta">
                    <p className="muted-text">Host: {vehicle.host?.name || 'Unknown'} ({vehicle.host?.email || 'No email'})</p>
                    <p className="muted-text">Category: {vehicle.category?.name || 'Uncategorized'}</p>
                    <p className="muted-text">Bookings: {vehicle.totalBookings || 0} | Rating: {vehicle.averageRating || 0}</p>
                  </div>
                  <div className="admin-entity-card__actions">
                    <Link
                      to={`/vehicles/${vehicle._id}`}
                      className="inline-flex items-center justify-center text-slate-300 transition-colors hover:text-sky-300"
                      aria-label="View vehicle"
                      title="View"
                    >
                      <Eye size={18} strokeWidth={2.25} />
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center text-rose-300 transition-colors hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() => handleDelete(vehicle)}
                      disabled={processingId === vehicle._id}
                      aria-label="Delete vehicle"
                      title="Delete"
                    >
                      <Trash2 size={18} strokeWidth={2.25} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      ) : null}

      <ConfirmModal
        open={Boolean(vehicleToDelete)}
        title="Remove Vehicle"
        message={vehicleToDelete ? `Remove ${vehicleToDelete.title}? This will deactivate the listing.` : ''}
        confirmLabel="Remove vehicle"
        confirmTone="danger"
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        disabled={Boolean(processingId)}
      />
    </div>
  );
}
