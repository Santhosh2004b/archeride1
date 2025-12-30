// src/api/feedApi.js
import axios from "axios";

const BASE = process.env.REACT_APP_API_URL;  // <-- FIXED

export const fetchLatestRisks = () => axios.get(`${BASE}/feed/latest-risks`);
export const fetchLatestCollections = () => axios.get(`${BASE}/feed/latest-collections`);
export const fetchLatestDependencies = () => axios.get(`${BASE}/feed/latest-dependencies`);
