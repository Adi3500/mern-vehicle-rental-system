import { useEffect, useState } from 'react';
import { MapPin, Phone, User } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { bookingApi, vehicleApi } from '../../api/endpoints';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import BookingForm from '../../components/forms/BookingForm';
import ReviewCard from '../../components/reviews/ReviewCard';
import BookingSummary from '../../components/vehicles/BookingSummary';
import VehicleGallery from '../../components/vehicles/VehicleGallery';
import { useAppSelector } from '../../hooks/redux';
import { formatCurrency, formatDate, getApiError, getStatusTone } from '../../utils/format';

export default function VehicleDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const [vehicle, setVehicle] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewPagination, setReviewPagination] = useState(null);
    const [reviewPage, setReviewPage] = useState(1);
    const [tripDraft, setTripDraft] = useState({
        startDate: '',
        endDate: '',
        customerNotes: '',
    });
    const [loading, setLoading] = useState(true);
    const [reviewLoading, setReviewLoading] = useState(true);
    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [detailError, setDetailError] = useState('');
    const [reviewError, setReviewError] = useState('');

    useEffect(() => {
        const loadVehicle = async () => {
            setLoading(true);
            setDetailError('');

            try {
                const response = await vehicleApi.getById(id);
                setVehicle(response.data?.data?.vehicle || null);
            } catch (apiError) {
                setDetailError(getApiError(apiError, 'We could not load this vehicle.'));
            } finally {
                setLoading(false);
            }
        };

        loadVehicle();
    }, [id]);

    useEffect(() => {
        const loadReviews = async () => {
            setReviewLoading(true);
            setReviewError('');

            try {
                const response = await vehicleApi.getReviews(id, { page: reviewPage, limit: 5 });
                setReviews(response.data?.data || []);
                setReviewPagination(response.data?.pagination || null);
            } catch (apiError) {
                setReviewError(getApiError(apiError, 'We could not load reviews for this vehicle.'));
            } finally {
                setReviewLoading(false);
            }
        };

        loadReviews();
    }, [id, reviewPage]);

    const handleBookingSubmit = async (payload) => {
        if (!isAuthenticated || user?.role !== 'customer') {
            navigate('/login', { state: { from: `/vehicles/${id}` } });
            return;
        }

        setBookingSubmitting(true);

        try {
            const response = await bookingApi.create({
                vehicleId: id,
                startDate: payload.startDate,
                endDate: payload.endDate,
                customerNotes: payload.customerNotes,
            });

            const bookingId = response.data?.data?.booking?._id;
            toast.success('Booking created. Continue to payment.');
            navigate(`/checkout/${bookingId}`);
        } catch (apiError) {
            toast.error(getApiError(apiError, 'We could not create your booking.'));
        } finally {
            setBookingSubmitting(false);
        }
    };

    if (loading) {
        return <Spinner fullScreen label = "Loading vehicle..." /> ;
    }

    if (detailError || !vehicle) {
        return (<div className = "page-container"><ErrorState title = "Vehicle not available"
            description = { detailError || 'We could not find the requested vehicle.' }
            action = { <Link className = "button button--ghost"
                to = "/"> Back to catalog </Link>} /></div>
            );
        }

        const canBook = isAuthenticated && user?.role === 'customer';
        const showGuestBookingPrompt = !isAuthenticated;
        const showCustomerOnlyMessage = isAuthenticated && user?.role !== 'customer';
        const overviewItems = [
            { label: 'Make & model', value: [vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'N/A' },
            { label: 'Year', value: vehicle.year || 'N/A' },
            { label: 'Color', value: vehicle.color || 'N/A' },
            { label: 'License plate', value: vehicle.licensePlate || 'N/A' },
            { label: 'Registration no.', value: vehicle.registrationNumber || 'N/A' },
            { label: 'Registration expiry', value: vehicle.registrationExpiryDate ? formatDate(vehicle.registrationExpiryDate) : 'N/A' },
            { label: 'Transmission', value: vehicle.transmission || 'N/A' },
            { label: 'Fuel type', value: vehicle.fuelType || 'N/A' },
            { label: 'Seats', value: vehicle.seats || 'N/A' },
            { label: 'Category', value: vehicle.category?.name || 'Vehicle' },
            { label: 'Price per hour', value: vehicle.pricePerHour ? formatCurrency(vehicle.pricePerHour) : 'N/A' },
            { label: 'Total bookings', value: vehicle.totalBookings || 0 },
            { label: 'Status', value: vehicle.status },
        ];

        const locationItems = [
            { label: 'Address', value: vehicle.location?.address || 'N/A' },
            { label: 'City', value: vehicle.location?.city || 'N/A' },
            { label: 'State', value: vehicle.location?.state || 'N/A' },
            { label: 'Country', value: vehicle.location?.country || 'N/A' },
            { label: 'ZIP / Postal code', value: vehicle.location?.zipCode || 'N/A' },
        ];

        return (<div className = "page-container"><div className = "page-header"><h1> { vehicle.title } </h1><p> { vehicle.description } </p></div><section className = "vehicle-detail__hero"><div className = "vehicle-detail__main-column"><div className = "card"><VehicleGallery images = { vehicle.images }
                title = { vehicle.title } /></div><div className = "card"><h3 style = {
                    { marginBottom: '1rem' }
                }> Vehicle Overview </h3><div className = "vehicle-detail__facts"> {
                    overviewItems.map((item) => (<div key = { item.label }
                        className = "vehicle-detail__fact"><span> { item.label } </span><strong> { item.value } </strong></div>
                    ))
                } </div></div><div className = "card"><h3 style = {
                    { marginBottom: '1rem' }
                }> Location Details </h3><div className = "vehicle-detail__facts"> {
                    locationItems.map((item) => (<div key = { item.label }
                        className = "vehicle-detail__fact"><span> { item.label } </span><strong> { item.value } </strong></div>
                    ))
                } </div></div><div className = "card"><h3 style = {
                    { marginBottom: '1rem' }
                }> Features </h3> {
                vehicle.features?.length ? (<div style = {
                        { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }
                    }> {
                        vehicle.features.map((feature) => (<span key = { feature }
                            className = "pill"> { feature } </span>
                        ))
                    } </div>
                ) : (<p className = "muted-text"> No feature list provided
                    for this vehicle yet. </p>
                )
            } </div>
        {
            vehicle.unavailableDates?.length ? (<div className = "card"><h3 style = {
                    { marginBottom: '1rem' }
                }> Unavailable Dates </h3><div className = "vehicle-detail__blocked-dates"> {
                    vehicle.unavailableDates.map((range, index) => (<span key = { `${range.startDate}-${index}` }
                        className = "badge badge-warning"> { formatDate(range.startDate) }
                        to { formatDate(range.endDate) } </span>
                    ))
                } </div></div>
            ) : (<div className = "card"><h3 style = {
                    { marginBottom: '1rem' }
                }> Availability </h3><p className = "muted-text"> No blocked dates have been added
                for this vehicle yet. </p></div>
            )
        }
            </div><div className = "vehicle-detail__sidebar"><div className = "card vehicle-detail__booking-card"><div className = "vehicle-detail__price-row"><div><p className = "muted-text"> Price per day </p><strong> { formatCurrency(vehicle.pricePerDay) } </strong></div><span className = { `badge badge-${getStatusTone(vehicle.status)}` }> { vehicle.status } </span></div><BookingSummary vehicle = { vehicle }
                startDate = { tripDraft.startDate }
                endDate = { tripDraft.endDate } /><div className = "vehicle-detail__booking-panel"><div><h3> Plan your trip </h3><p className = "muted-text"> Pick dates and
                continue to checkout when you are ready. </p></div>

                {
                    canBook ? (<BookingForm onSubmit = { handleBookingSubmit }
                        submitting = { bookingSubmitting }
                        unavailableDates = { vehicle.unavailableDates }
                        onValuesChange = { setTripDraft } />
                    ) : showGuestBookingPrompt ? (<div className = "vehicle-detail__login-card"><p className = "muted-text">
                        Log in as a customer to book this vehicle and
                        continue to payment. </p><Link to = "/login"
                        className = "button button--primary">
                        Login to book </Link></div>
                    ) : showCustomerOnlyMessage ? (<div className = "vehicle-detail__login-card"><p className = "muted-text">
                        Booking is available only
                        for customer accounts.You can still review the full vehicle details here. </p></div>
                    ) : null
                } </div></div><div className = "card"><h3 style = {
                    { marginBottom: '1rem' }
                }> Host Details </h3><div className = "vehicle-detail__host"><div className = "vehicle-detail__host-row"><User size = { 18 } /><span> { vehicle.host?.name || 'Host' } </span></div><div className = "vehicle-detail__host-row"><Phone size = { 18 } /><span> { vehicle.host?.phone || 'Phone hidden until booking' } </span></div><div className = "vehicle-detail__host-row"><MapPin size = { 18 } /><span> { vehicle.location?.address }, { vehicle.location?.city }, { vehicle.location?.country } </span></div><div className = "vehicle-detail__host-row"><span className = "rating-chip"> { vehicle.averageRating || 0 }
                / 5</span><span className = "muted-text"> { vehicle.totalReviews || 0 }
                reviews </span></div></div></div></div></section><section className = "vehicle-detail__content">

        <div className = "card vehicle-detail__reviews"><div style = {
                { display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }
            }><div><h3> Reviews </h3><p className = "muted-text"> Feedback from completed bookings. </p></div><span className = "rating-chip"> { vehicle.averageRating || 0 }
        / 5</span></div>

        {
            reviewError ? <ErrorState title = "Reviews unavailable"
            description = { reviewError } /> : null}

            {
                reviewLoading ? (<Spinner label = "Loading reviews..." />
                ) : reviews.length === 0 ? (<p className = "muted-text"> No reviews yet. </p>
                ) : (<div style = {
                        { display: 'grid', gap: '1rem' }
                    }> {
                        reviews.map((review) => (<ReviewCard key = { review._id }
                            review = { review }
                            canManage = { false } />
                        ))
                    } <Pagination pagination = { reviewPagination }
                    onPageChange = { setReviewPage } /></div>
                )
            } </div></section></div>
        );
    }
