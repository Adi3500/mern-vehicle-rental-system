import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminUserApi } from '../../api/endpoints';
import AdminSectionNav from '../../components/admin/AdminSectionNav';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import { formatDate, getApiError } from '../../utils/format';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [blocked, setBlocked] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);
  const [error, setError] = useState('');

  const loadUsers = async (nextPage = page, nextBlocked = blocked) => {
    setLoading(true);
    setError('');

    try {
      const response = await adminUserApi.list({
        isBlocked: nextBlocked || undefined,
        page: nextPage,
        limit: 20,
      });

      setUsers(response.data?.data || []);
      setPagination(response.data?.pagination || null);
    } catch (apiError) {
      setError(getApiError(apiError, 'We could not load admin users.'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await adminUserApi.list({
          isBlocked: blocked || undefined,
          page,
          limit: 20,
        });

        setUsers(response.data?.data || []);
        setPagination(response.data?.pagination || null);
      } catch (apiError) {
        setError(getApiError(apiError, 'We could not load admin users.'));
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, blocked]);

  const customers = users.filter((item) => item.role === 'customer');
  const hosts = users.filter((item) => item.role === 'host');

  const handleHostApproval = async (targetUser) => {
    setProcessingId(targetUser._id);

    try {
      if (targetUser.isApproved) {
        await adminUserApi.rejectHost(targetUser._id);
        toast.success('Host moved back to pending.');
      } else {
        await adminUserApi.approveHost(targetUser._id);
        toast.success('Host approved.');
      }

      loadUsers(page, blocked);
    } catch (apiError) {
      toast.error(getApiError(apiError, 'We could not update this host.'));
    } finally {
      setProcessingId('');
    }
  };

  const handleBlockToggle = async (targetUser) => {
    setProcessingId(targetUser._id);

    try {
      if (targetUser.isBlocked) {
        await adminUserApi.unblock(targetUser._id);
        toast.success('User unblocked.');
      } else {
        await adminUserApi.block(targetUser._id);
        toast.success('User blocked.');
      }

      loadUsers(page, blocked);
    } catch (apiError) {
      toast.error(getApiError(apiError, 'We could not update this user.'));
    } finally {
      setProcessingId('');
    }
  };

  const handleDelete = async (targetUser) => {
    setUserToDelete(targetUser);
  };

  const closeDeleteModal = () => {
    if (processingId) return;
    setUserToDelete(null);
  };

  const confirmDelete = async () => {
    if (!userToDelete) {
      return;
    }

    setProcessingId(userToDelete._id);

    try {
      await adminUserApi.remove(userToDelete._id);
      toast.success('User deleted.');
      setUserToDelete(null);
      loadUsers(page, blocked);
    } catch (apiError) {
      toast.error(getApiError(apiError, 'We could not delete this user.'));
    } finally {
      setProcessingId('');
    }
  };

  const renderUserTable = (title, description, items, includeHostStatus = false) => (
    <div className="card">
      <div className="card-header">
        <div>
          <h3>{title}</h3>
          <p className="muted-text">{description}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="muted-text">No {title.toLowerCase()} on this page.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Created</th>
                {includeHostStatus ? <th>Host Active</th> : null}
                <th>Account Access</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const busy = processingId === item._id;

                return (
                  <tr key={item._id}>
                    <td>
                      <div className="info-stack">
                        <strong>{item.name}</strong>
                        <span className="muted-text">{item.email}</span>
                      </div>
                    </td>
                    <td>{item.phone || 'No phone on file'}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    {includeHostStatus ? (
                      <td>
                        <button
                          type="button"
                          className={`toggle-switch ${item.isApproved ? 'is-on' : ''}`}
                          onClick={() => handleHostApproval(item)}
                          disabled={busy}
                          aria-pressed={item.isApproved}
                        >
                          <span className="toggle-switch__track">
                            <span className="toggle-switch__thumb" />
                          </span>
                          <span className="toggle-switch__label">{item.isApproved ? 'On' : 'Off'}</span>
                        </button>
                      </td>
                    ) : null}
                    <td>
                      <button
                        type="button"
                        className={`toggle-switch ${!item.isBlocked ? 'is-on' : ''}`}
                        onClick={() => handleBlockToggle(item)}
                        disabled={busy}
                        aria-pressed={!item.isBlocked}
                      >
                        <span className="toggle-switch__track">
                          <span className="toggle-switch__thumb" />
                        </span>
                        <span className="toggle-switch__label">{item.isBlocked ? 'Off' : 'On'}</span>
                      </button>
                    </td>
                    <td>
                      <div className="inline-actions flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center text-rose-300 transition-colors hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
                          onClick={() => handleDelete(item)}
                          disabled={busy}
                          aria-label="Delete user"
                          title="Delete"
                        >
                          <Trash2 size={18} strokeWidth={2.25} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-container page-container--admin">
      <div className="page-header page-header--admin">
        <span className="page-eyebrow">Admin moderation</span>
        <h1>User Management</h1>
        <p>Review customers and hosts separately, and control account access with quick toggles.</p>
      </div>

      <AdminSectionNav />

      <div className="card admin-toolbar-card">
        <div className="admin-toolbar">
          <label className="field" style={{ minWidth: '220px' }}>
            <span>Account state</span>
            <select value={blocked} onChange={(event) => { setBlocked(event.target.value); setPage(1); }}>
              <option value="">All users</option>
              <option value="false">Active only</option>
              <option value="true">Blocked only</option>
            </select>
          </label>

          <div className="admin-toolbar__actions">
            <button type="button" className="button button--ghost" onClick={loadUsers}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? <Spinner label="Loading admin users..." /> : null}
      {error ? <ErrorState title="Users unavailable" description={error} /> : null}

      {!loading && !error && users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try adjusting the account state filter to load a different user segment."
        />
      ) : null}

      {!loading && !error && users.length > 0 ? (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {renderUserTable('Hosts', 'Manage host approvals and access.', hosts, true)}
          {renderUserTable('Customers', 'Manage customer access and account cleanup.', customers)}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      ) : null}

      <ConfirmModal
        open={Boolean(userToDelete)}
        title="Delete User"
        message={userToDelete ? `Delete ${userToDelete.name}'s account? This performs a soft delete.` : ''}
        confirmLabel="Delete user"
        confirmTone="danger"
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        disabled={Boolean(processingId)}
      />
    </div>
  );
}
