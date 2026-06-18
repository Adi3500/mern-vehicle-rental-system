import { useEffect, useState } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { hostVehicleApi } from '../../api/endpoints';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, getApiError, getPrimaryImage } from '../../utils/format';

export default function HostVehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState('');
    const [vehicleToDelete, setVehicleToDelete] = useState('');
    const [error, setError] = useState('');

    const loadVehicles = async (nextPage = page, nextStatus = status) => {
        setLoading(true);
        setError('');
        try {
            const response = await hostVehicleApi.list({ status: nextStatus || undefined, page: nextPage, limit: 10 });
            setVehicles(response.data?.data || []);
            setPagination(response.data?.pagination || null);
        } catch (apiError) {
            setError(getApiError(apiError, 'We could not load your vehicles.'));
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await hostVehicleApi.list({ status: status || undefined, page, limit: 10 });
                setVehicles(response.data?.data || []);
                setPagination(response.data?.pagination || null);
            } catch (apiError) {
                setError(getApiError(apiError, 'We could not load your vehicles.'));
                setVehicles([]);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, [page, status]);

    const handleDelete = async () => {
        if (!vehicleToDelete) return;
        setProcessingId(vehicleToDelete);
        try {
            await hostVehicleApi.remove(vehicleToDelete);
            toast.success('Vehicle deleted.');
            setVehicleToDelete('');
            loadVehicles(page, status);
        } catch (apiError) {
            toast.error(getApiError(apiError, 'We could not delete this vehicle.'));
        } finally {
            setProcessingId('');
        }
    };

    const handleStatusToggle = async (vehicle) => {
        const nextStatus = vehicle.status === 'active' ? 'inactive' : 'active';
        const payload = new FormData();
        payload.append('status', nextStatus);
        setProcessingId(vehicle._id);
        try {
            await hostVehicleApi.update(vehicle._id, payload);
            toast.success(`Vehicle marked ${nextStatus}.`);
            loadVehicles(page, status);
        } catch (apiError) {
            toast.error(getApiError(apiError, 'We could not update this vehicle status.'));
        } finally {
            setProcessingId('');
        }
    };

    return (<div className = "page-container"><div className = "page-header"><span className = "page-eyebrow"> Host workspace </span><h1> My Vehicles </h1><p> Manage your host listings with quick status controls and easy editing. </p></div>

        { /* Toolbar */ } <div className = "card admin-toolbar-card"
        style = {
            { marginBottom: '1.25rem' }
        }><div className = "toolbar-row"><label className = "field"
        style = {
            { minWidth: '220px' }
        }><span> Status filter </span><select className = "form-control"
        value = { status }
        onChange = {
            (event) => {
                setStatus(event.target.value);
                setPage(1);
            }
        }><option value = ""> All statuses </option><option value = "active"> Active </option><option value = "inactive"> Inactive </option></select></label><div className = "toolbar-row__actions"><button type = "button"
        className = "button button--ghost"
        onClick = {
            () => loadVehicles()
        }>
        Refresh </button><Link to = "/host/vehicles/new"
        className = "button button--primary"><Plus size = { 15 } />
        Add vehicle </Link></div></div></div>

        { loading ? <Spinner label = "Loading host vehicles..." /> : null } {
            error ? <ErrorState title = "Vehicles unavailable"
            description = { error } /> : null}

            {
                !loading && !error && vehicles.length === 0 ? (<EmptyState title = "No vehicles yet"
                    description = "Create your first listing to start taking bookings."
                    action = { <Link to = "/host/vehicles/new"
                        className = "button button--primary"><Plus size = { 15 } /> Create vehicle</Link>
                    } />
                ) : null
            }

            {
                !loading && !error && vehicles.length> 0 ? (<><div className = "card"><div className = "admin-table-wrap"><table className = "table"><thead><tr><th> Vehicle </th><th> Category </th><th> Specs </th><th> Price </th><th> Active </th><th> Actions </th></tr></thead><tbody> {
                        vehicles.map((vehicle) => {
                            const busy = processingId === vehicle._id;
                            const isOn = vehicle.status === 'active';

                            return (<tr key = { vehicle._id }><td><div style = {
                                    { display: 'flex', alignItems: 'center', gap: '0.75rem' }
                                }><div style = {
                                    {
                                        width: '3rem',
                                        height: '2.25rem',
                                        borderRadius: 'var(--radius-sm)',
                                        overflow: 'hidden',
                                        border: '1px solid var(--border-subtle)',
                                        flexShrink: 0,
                                        background: 'var(--obsidian-800)',
                                    }
                                }><img src = { getPrimaryImage(vehicle.images) }
                                alt = { vehicle.title }
                                style = {
                                    { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
                                } /></div><div className = "info-stack"><strong style = {
                                    { color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }
                                }> { vehicle.title } </strong><span className = "muted-text"
                                style = {
                                    { fontSize: 'var(--font-size-xs)' }
                                }> { vehicle.location?.city }, { vehicle.location?.country } </span></div></div></td><td> { vehicle.category?.name || 'Vehicle' } </td><td className = "muted-text"
                                style = {
                                    { fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)' }
                                }> { vehicle.seats || 0 }
                                seats· { vehicle.transmission || 'manual' }· { vehicle.fuelType || 'petrol' } </td><td><span style = {
                                    { fontFamily: 'var(--font-mono)', color: 'var(--chrome-300)', fontWeight: 'var(--font-weight-bold)' }
                                }> { formatCurrency(vehicle.pricePerDay) } </span><span className = "muted-text"
                                style = {
                                    { fontSize: 'var(--font-size-xs)' }
                                }> /day</span></td><td> { /* Toggle switch */ } <button type = "button"
                                onClick = {
                                    () => handleStatusToggle(vehicle)
                                }
                                disabled = { busy }
                                aria-pressed = { isOn }
                                aria-label = { `Set ${vehicle.title} ${isOn ? 'inactive' : 'active'}` }
                                style = {
                                    {
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        background: 'none',
                                        border: 'none',
                                        cursor: busy ? 'not-allowed' : 'pointer',
                                        opacity: busy ? 0.5 : 1,
                                        padding: 0,
                                    }
                                }><span style = {
                                    {
                                        position: 'relative',
                                        display: 'inline-block',
                                        width: '2.25rem',
                                        height: '1.25rem',
                                        borderRadius: 'var(--radius-full)',
                                        background: isOn ? 'rgba(52,211,153,0.3)' : 'var(--obsidian-600)',
                                        border: isOn ? '1px solid rgba(52,211,153,0.5)' : '1px solid var(--border-default)',
                                        transition: 'all 0.2s',
                                    }
                                }><span style = {
                                    {
                                        position: 'absolute',
                                        top: '50%',
                                        left: isOn ? 'calc(100% - 0.95rem)' : '0.15rem',
                                        transform: 'translateY(-50%)',
                                        width: '0.875rem',
                                        height: '0.875rem',
                                        borderRadius: '50%',
                                        background: isOn ? 'var(--jade-400)' : 'var(--obsidian-400)',
                                        transition: 'all 0.2s',
                                        boxShadow: isOn ? '0 0 6px rgba(52,211,153,0.4)' : 'none',
                                    }
                                } /></span><span style = {
                                    { fontSize: 'var(--font-size-xs)', color: isOn ? 'var(--jade-400)' : 'var(--text-muted)' }
                                }> { isOn ? 'On' : 'Off' } </span></button></td><td><div className = "inline-actions"><Link to = { `/vehicles/${vehicle._id}` }
                                className = "icon-button"
                                aria-label = "View"
                                title = "View"><Eye size = { 15 } /></Link><Link to = { `/host/vehicles/${vehicle._id}/edit` }
                                className = "icon-button"
                                aria-label = "Edit"
                                title = "Edit"
                                style = {
                                    { color: 'var(--sky-300)', borderColor: 'rgba(56,189,248,0.2)' }
                                }><Pencil size = { 15 } /></Link><button type = "button"
                                className = "icon-button"
                                onClick = {
                                    () => setVehicleToDelete(vehicle._id)
                                }
                                disabled = { busy }
                                aria-label = "Delete"
                                title = "Delete"
                                style = {
                                    { color: 'var(--rose-400)', borderColor: 'rgba(248,113,113,0.2)' }
                                }><Trash2 size = { 15 } /></button></div></td></tr>
                            );
                        })
                    } </tbody></table></div></div><Pagination pagination = { pagination }
                    onPageChange = { setPage } /></>
                ) : null
            }

            <ConfirmModal
            open = { Boolean(vehicleToDelete) }
            title = "Delete Vehicle Listing"
            message = "Delete this vehicle listing? This action cannot be undone."
            confirmLabel = "Delete vehicle"
            confirmTone = "danger"
            onClose = {
                () => {
                    if (processingId) return;
                    setVehicleToDelete('');
                }
            }
            onConfirm = { handleDelete }
            disabled = { Boolean(processingId) } /></div>
        );
    }