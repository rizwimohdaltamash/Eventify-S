import apiClient from './client';

// Fetch all attendees
export const fetchAllAttendees = async () => {
  const response = await apiClient.get('/api/attendees');
  return response.data;
};

// Book an event
export const bookEvent = async (bookingData) => {
  const response = await apiClient.post('/api/attendees/book', bookingData);
  return response.data;
};

// Create a new attendee
export const createAttendee = async (attendeeData) => {
  const response = await apiClient.post('/api/attendees', attendeeData);
  return response.data;
};

// Update an attendee
export const updateAttendee = async ({ id, data }) => {
  const response = await apiClient.put(`/api/attendees/${id}`, data);
  return response.data;
};

// Delete an attendee
export const deleteAttendee = async (id) => {
  const response = await apiClient.delete(`/api/attendees/${id}`);
  return response.data;
};

// Cancel booking for logged-in user
export const cancelBooking = async (eventId) => {
  const response = await apiClient.delete(`/api/attendees/cancel/${eventId}`);
  return response.data;
};

// Update booking status (admin only)
export const updateBookingStatus = async ({ id, status, rejectionReason }) => {
  const response = await apiClient.patch(`/api/attendees/${id}/status`, { 
    status, 
    rejectionReason 
  });
  return response.data;
};
