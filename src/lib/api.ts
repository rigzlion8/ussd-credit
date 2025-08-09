import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});