import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { hostBookingApi } from '../../api/endpoints';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import PromptModal from '../../components/common/PromptModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate, getApiError, getStatusTone } from '../../utils/format';

export default function HostBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [responseDraft, setResponseDraft] = useState(null);
    const [pendingComplete, setPendingComplete] = useState(null);
    const [responding, setResponding] = useState(false);
    const [error, setError] = useState('');

    const loadBookings = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await hostBookingApi.list({ status: status || undefined, page, limit: 10 });
            setBookings(response.data?.data || []);
            setPagination(response.data?.pagination || null);
        } catch (apiError) {
            setError(getApiError(apiError, 'We could not load host bookings.'));
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
                const response = await hostBookingApi.list({ status: status || undefined, page, limit: 10 });
                setBookings(response.data?.data || []);
                setPagination(response.data?.pagination || null);
            } catch (apiError) {
                setError(getApiError(apiError, 'We could not load host bookings.'));
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [page, status]);

    const openResponseModal = (bookingId, nextStatus) => {
        setResponseDraft({ bookingId, nextStatus, hostNotes: '' });
    };

    const closeResponseModal = () => {
        if (responding) return;
        setResponseDraft(null);
    };

    const handleRespond = async (event) => {
        event.preventDefault();
        if (!responseDraft?.bookingId || !responseDraft?.nextStatus) return;
        setResponding(true);
        try {
            await hostBookingApi.respond(responseDraft.bookingId, {
                status: responseDraft.nextStatus,
                hostNotes: responseDraft.hostNotes.trim() || undefined,
            });
            toast.success(`Booking ${responseDraft.nextStatus}.`);
            setResponseDraft(null);
            loadBookings();
        } catch (apiError) {
            toast.error(getApiError(apiError, 'We could not update this booking.'));
        } finally {
            setResponding(false);
        }
    };

    const confirmComplete = async () => {
        if (!pendingComplete) return;
        setResponding(true);
        try {
            await hostBookingApi.complete(pendingComplete);
            toast.success('Booking marked as completed.');
            setPendingComplete(null);
            loadBookings();
        } catch (apiError) {
            toast.error(getApiError(apiError, 'We could not complete this booking.'));
        } finally {
            setResponding(false);
        }
    };

    return (<div className = "page-container"><div className = "page-header"><span className = "page-eyebrow"> Host workspace </span><h1> Bookings </h1><p> Respond to customer requests and track the status of your vehicle bookings. </p></div>

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

            { loading ? <Spinner label = "Loading host bookings..." /> : null } {
                error ? <ErrorState title = "Bookings unavailable"
                description = { error } /> : null}

                {
                    !loading && !error && bookings.length === 0 ? (<EmptyState title = "No host bookings yet"
                        description = "New booking requests will appear here as customers start reserving your vehicles."
                        action = { <Link to = "/host/vehicles"
                            className = "button button--primary"> View vehicles </Link>} />
                        ): null
                    }

                    {
                        !loading && !error && bookings.length> 0 ? (<div className = "card"><div className = "admin-table-wrap"><table className = "table"><thead><tr><th> Vehicle </th><th> Customer </th><th> Trip </th><th> Status </th><th> Total </th><th> Actions </th></tr></thead><tbody> {
                                bookings.map((booking) => (<tr key = { booking._id }><td><strong style = {
                                        { color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }
                                    }> { booking.vehicle?.title || 'Vehicle' } </strong></td><td> { booking.customer?.name || 'Customer' } </td><td style = {
                                        { fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }
                                    }> { formatDate(booking.startDate) }→ { formatDate(booking.endDate) } </td><td><span className = { `badge status-badge--${getStatusTone(booking.bookingStatus)}` }> { booking.bookingStatus } </span></td><td className = "table-value"> { formatCurrency(booking.totalPrice) } </td><td><div className = "inline-actions"><Link to = { `/bookings/${booking._id}` }
                                    className = "icon-button"
                                    aria-label = "View booking"
                                    title = "View"><Eye size = { 15 } /></Link> {
                                        booking.bookingStatus === 'pending' ? (<><button type = "button"
                                            className = "button button--success button--sm"
                                            onClick = {
                                                () => openResponseModal(booking._id, 'confirmed')
                                            }>
                                            Confirm </button><button type = "button"
                                            className = "button button--danger button--sm"
                                            onClick = {
                                                () => openResponseModal(booking._id, 'rejected')
                                            }>
                                            Reject </button></>
                                        ) : null
                                    } {
                                        booking.bookingStatus === 'confirmed' ? (
                                            <button type = "button"
                                            className = "button button--primary button--sm"
                                            onClick = {
                                                () => setPendingComplete(booking._id)
                                            }>
                                            Complete </button>
                                        ) : null
                                    } </div></td></tr>
                                ))
                            } </tbody></table></div><Pagination pagination = { pagination }
                            onPageChange = { setPage } /></div>
                        ) : null
                    }

                    <PromptModal
                    open = { Boolean(responseDraft) }
                    title = { responseDraft?.nextStatus === 'confirmed' ? 'Confirm Booking' : 'Reject Booking' }
                    message = { `Add an optional note for this ${responseDraft?.nextStatus || 'booking'} action.` }
                    label = "Host note"
                    value = { responseDraft?.hostNotes || '' }
                    onChange = {
                        (value) => setResponseDraft((prev) => (prev ? {...prev, hostNotes: value } : prev))
                    }
                    onClose = { closeResponseModal }
                    onSubmit = { handleRespond }
                    submitLabel = {
                        responding ?
                        responseDraft?.nextStatus === 'confirmed' ? 'Confirming…' : 'Rejecting…' :
                        responseDraft?.nextStatus === 'confirmed' ? 'Confirm booking' : 'Reject booking'
                    }
                    placeholder = "Optional message for the customer"
                    disabled = { responding } />

                    <ConfirmModal
                        open = { Boolean(pendingComplete) }
                        title = "Complete Booking"
                        message = { `Mark booking ${pendingComplete} as completed?` }
                        confirmLabel = "Complete booking"
                        confirmTone = "primary"
                        onClose = { () => setPendingComplete(null) }
                        onConfirm = { confirmComplete }
                        disabled = { responding } /></div>
                );
            }