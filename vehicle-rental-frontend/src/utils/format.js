import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value || 0);

export const formatDate = (value, pattern = 'MMM d, yyyy') => {
  if (!value) return 'TBD';

  const parsed = typeof value === 'string' ? parseISO(value) : new Date(value);
  return isValid(parsed) ? format(parsed, pattern) : 'Invalid date';
};

export const formatDateTime = (value) => formatDate(value, 'MMM d, yyyy p');

export const getTodayInputDate = () => format(new Date(), 'yyyy-MM-dd');

export const getPrimaryImage = (images) =>
  images?.[0]?.url ||
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80';

export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const calculateTripDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = typeof startDate === 'string' ? parseISO(startDate) : new Date(startDate);
  const end = typeof endDate === 'string' ? parseISO(endDate) : new Date(endDate);

  if (!isValid(start) || !isValid(end)) return 0;
  return Math.max(1, differenceInCalendarDays(end, start));
};

export const calculateEstimate = (vehicle, startDate, endDate) => {
  const days = calculateTripDays(startDate, endDate);
  const subtotal = days * (vehicle?.pricePerDay || 0);
  const serviceFee = Number((subtotal * 0.1).toFixed(2));
  const total = subtotal + serviceFee;

  return { days, subtotal, serviceFee, total };
};

export const isDateRangeBlocked = (blockedDates = [], startDate, endDate) => {
  if (!startDate || !endDate) return false;

  const requestedStart = new Date(startDate);
  const requestedEnd = new Date(endDate);

  return blockedDates.some(({ startDate: blockedStart, endDate: blockedEnd }) => {
    const start = new Date(blockedStart);
    const end = new Date(blockedEnd);
    return start <= requestedEnd && end >= requestedStart;
  });
};

export const getApiError = (error, fallback = 'Something went wrong.') =>
  error?.response?.data?.message || error?.message || fallback;

export const toTitleCase = (value = '') =>
  value
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const getStatusTone = (status = '') => {
  const normalized = status.toLowerCase();

  if (['paid', 'confirmed', 'completed', 'active', 'approved', 'success'].includes(normalized)) {
    return 'success';
  }

  if (['cancelled', 'rejected', 'inactive', 'blocked', 'error', 'failed', 'refunded'].includes(normalized)) {
    return 'danger';
  }

  if (['pending', 'unpaid', 'pending_review', 'warning'].includes(normalized)) {
    return 'warning';
  }

  return 'info';
};
