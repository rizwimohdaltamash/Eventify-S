import apiClient from './client';

// Fetch all public events (no auth required)
export const fetchPublicEvents = async () => {
  const response = await apiClient.get('/api/events/public');
  return response.data;
};

// Fetch all events
export const fetchAllEvents = async () => {
  const response = await apiClient.get('/api/events');
  return response.data;
};

// Fetch single event by ID
export const fetchEventById = async (id) => {
  const response = await apiClient.get(`/api/events/${id}`);
  return response.data;
};

// Create a new event
export const createEvent = async (eventData) => {
  const response = await apiClient.post('/api/events', eventData);
  return response.data;
};

// Update an event
export const updateEvent = async ({ id, data }) => {
  const response = await apiClient.put(`/api/events/${id}`, data);
  return response.data;
};

// Delete an event
export const deleteEvent = async (id) => {
  const response = await apiClient.delete(`/api/events/${id}`);
  return response.data;
};

// Fetch attendees by event ID
export const fetchAttendeesByEventId = async (eventId) => {
  const response = await apiClient.get(`/api/attendees/event/${eventId}`);
  return response.data;
};
