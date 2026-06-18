import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { bookingApi } from '../../api/endpoints';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import PromptModal from '../../components/common/PromptModal';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate, getApiError, getStatusTone } from '../../utils/format';

export default function CustomerBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [cancelDraft, setCancelDraft] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState('');

    const loadBookings = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await bookingApi.getMine({ status: status || undefined, page, limit: 10 });
            setBookings(response.data?.data || []);
            setPagination(response.data?.pagination || null);
        } catch (apiError) {
            setError(getApiError(apiError, 'We could not load your bookings.'));
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await bookingApi.getMine({ status: status || undefined, page, limit: 10 });
                setBookings(response.data?.data || []);
                setPagination(response.data?.pagination || null);
            } catch (apiError) {
                setError(getApiError(apiError, 'We could not load your bookings.'));
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [page, status]);

    const openCancelModal = (bookingId) => setCancelDraft({ bookingId, reason: 'Plans changed' });
    const closeCancelModal = () => {
        if (cancelling) return;
        setCancelDraft(null);
    };

    const handleCancel = async (event) => {
        event.preventDefault();
        if (!cancelDraft?.bookingId || !cancelDraft.reason?.trim()) return;
        setCancelling(true);
        try {
            await bookingApi.cancel(cancelDraft.bookingId, cancelDraft.reason.trim());
            toast.success('Booking cancelled.');
            setCancelDraft(null);
            loadBookings();
        } catch (apiError) {
            toast.error(getApiError(apiError, 'We could not cancel the booking.'));
        } finally {
            setCancelling(false);
        }
    };

    return (<div className = "page-container"><div className = "page-header"><span className = "page-eyebrow"> Account </span><h1> My Bookings </h1><p> View and manage all your vehicle booking reservations. </p></div>

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
            }><option value = ""> All statuses </option><option value = "pending"> Pending </option><option value = "confirmed"> Confirmed </option><option value = "cancelled"> Cancelled </option><option value = "completed"> Completed </option><option value = "rejected"> Rejected </option></select></label><div className = "toolbar-row__actions"><button type = "button"
            className = "button button--ghost"
            onClick = { loadBookings }>
            Refresh </button></div></div></div>

            { loading ? <Spinner label = "Loading bookings..." /> : null } {
                error ? <ErrorState title = "Bookings unavailable"
                description = { error } /> : null}

                {
                    !loading && !error && bookings.length === 0 ? (<EmptyState title = "No bookings yet"
                        description = "Once you reserve a vehicle, it will show up here."
                        action = { <Link to = "/"
                            className = "button button--primary"> Browse vehicles </Link>} />
                        ): null
                    }

                    {
                        !loading && !error && bookings.length> 0 ? (<div className = "card"><div className = "admin-table-wrap"><table className = "table"><thead><tr><th> Vehicle </th><th> Trip dates </th><th> Status </th><th> Payment </th><th> Total </th><th> Actions </th></tr></thead><tbody> {
                                bookings.map((booking) => (<tr key = { booking._id }><td><strong style = {
                                        { color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }
                                    }> { booking.vehicle?.title || 'Vehicle' } </strong></td><td style = {
                                        { fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }
                                    }> { formatDate(booking.startDate) }→ { formatDate(booking.endDate) } </td><td><span className = { `badge status-badge--${getStatusTone(booking.bookingStatus)}` }> { booking.bookingStatus } </span></td><td><span className = { `badge status-badge--${getStatusTone(booking.paymentStatus)}` }> { booking.paymentStatus } </span></td><td className = "table-value"> { formatCurrency(booking.totalPrice) } </td><td><div className = "inline-actions"><Link to = { `/bookings/${booking._id}` }
                                    className = "icon-button"
                                    aria-label = "View booking"
                                    title = "View"><Eye size = { 15 } /></Link> {
                                        booking.paymentStatus === 'unpaid' && ['pending', 'confirmed'].includes(booking.bookingStatus) ? (<Link to = { `/checkout/${booking._id}` }
                                            className = "button button--primary button--sm">
                                            Pay now </Link>
                                        ) : null
                                    } {
                                        ['pending', 'confirmed'].includes(booking.bookingStatus) ? (<button type = "button"
                                            className = "button button--danger button--sm"
                                            onClick = {
                                                () => openCancelModal(booking._id)
                                            }>
                                            Cancel </button>
                                        ) : null
                                    } </div></td></tr>
                                ))
                            } </tbody></table></div><Pagination pagination = { pagination }
                            onPageChange = { setPage } /></div>
                        ) : null
                    }

                    <PromptModal
                    open = { Boolean(cancelDraft) }
                    title = "Cancel Booking"
                    message = "Share a short reason for the cancellation. The host will be notified."
                    label = "Cancellation reason"
                    value = { cancelDraft?.reason || '' }
                    onChange = {
                        (value) => setCancelDraft((prev) => (prev ? {...prev, reason: value } : prev))
                    }
                    onClose = { closeCancelModal }
                    onSubmit = { handleCancel }
                    submitLabel = { cancelling ? 'Cancelling…' : 'Cancel booking' }
                    placeholder = "Plans changed"
                    disabled = { cancelling }
                    required /></div>
                );
            }