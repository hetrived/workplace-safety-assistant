import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: API_URL })

export const sendMessage = (message) =>
  api.post('/api/chat/', { message }).then(r => r.data)

export const getIncidents = () =>
  api.get('/api/incidents/').then(r => r.data)

export const createIncident = (data) =>
  api.post('/api/incidents/', data).then(r => r.data)

export const updateIncidentStatus = (id, status) =>
  api.patch(`/api/incidents/${id}/status`, { status }).then(r => r.data)

export const getAnalytics = () =>
  api.get('/api/analytics/').then(r => r.data)

export const getNotifications = () =>
  api.get('/api/notifications/').then(r => r.data)

export const markNotificationRead = (id) =>
  api.patch(`/api/notifications/${id}/read`).then(r => r.data)
