import axios from 'axios'

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true, // prêt pour cookies httpOnly
})