import api from './client';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (payload) =>
    api.patch('/auth/update-profile', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  changePassword: (payload) => api.patch('/auth/change-password', payload),
};

export const vehicleApi = {
  list: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  getReviews: (id, params) => api.get(`/vehicles/${id}/reviews`, { params }),
};

export const categoryApi = {
  list: () => api.get('/categories'),
};

export const bookingApi = {
  create: (payload) => api.post('/bookings', payload),
  getMine: (params) => api.get('/bookings/my', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
};

export const hostVehicleApi = {
  list: (params) => api.get('/host/vehicles', { params }),
  create: (payload) =>
    api.post('/host/vehicles', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, payload) =>
    api.put(`/host/vehicles/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  remove: (id) => api.delete(`/host/vehicles/${id}`),
  removeImage: (id, publicId) => api.delete(`/host/vehicles/${id}/images`, { params: { publicId } }),
  updateAvailability: (id, unavailableDates) =>
    api.patch(`/host/vehicles/${id}/availability`, { unavailableDates }),
};

export const hostBookingApi = {
  list: (params) => api.get('/host/bookings', { params }),
  getById: (id) => api.get(`/host/bookings/${id}`),
  respond: (id, payload) => api.patch(`/host/bookings/${id}/respond`, payload),
  complete: (id) => api.patch(`/host/bookings/${id}/complete`),
  cancel: (id, reason) => api.patch(`/host/bookings/${id}/cancel`, { reason }),
};

export const reviewApi = {
  create: (payload) => api.post('/reviews', payload),
  update: (id, payload) => api.patch(`/reviews/${id}`, payload),
  remove: (id) => api.delete(`/reviews/${id}`),
};

export const paymentApi = {
  createIntent: (bookingId) => api.post(`/payments/intent/${bookingId}`),
  process: (bookingId, payload) => api.post(`/payments/process/${bookingId}`, payload),
};

export const earningsApi = {
  get: (params) => api.get('/host/earnings', { params }),
};

export const adminDashboardApi = {
  get: () => api.get('/admin/dashboard'),
};

export const adminUserApi = {
  list: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  block: (id) => api.put(`/admin/users/${id}/block`),
  unblock: (id) => api.put(`/admin/users/${id}/unblock`),
  remove: (id) => api.delete(`/admin/users/${id}`),
  approveHost: (id) => api.put(`/admin/hosts/${id}/approve`),
  rejectHost: (id) => api.put(`/admin/hosts/${id}/reject`),
};

export const adminVehicleApi = {
  list: (params) => api.get('/admin/vehicles', { params }),
  remove: (id) => api.delete(`/admin/vehicles/${id}`),
};

export const adminBookingApi = {
  list: (params) => api.get('/admin/bookings', { params }),
  getById: (id) => api.get(`/admin/bookings/${id}`),
  refund: (bookingId) => api.post(`/admin/payments/refund/${bookingId}`),
};

export const adminCategoryApi = {
  list: () => api.get('/admin/categories'),
  create: (payload) => api.post('/admin/categories', payload),
  update: (id, payload) => api.put(`/admin/categories/${id}`, payload),
  remove: (id) => api.delete(`/admin/categories/${id}`),
};
