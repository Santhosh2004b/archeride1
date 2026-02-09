
import axios from "axios";

const BASE = process.env.REACT_APP_API_URL;  

export const fetchLatestRisks = () => axios.get(`${BASE}/feed/latest-risks`);
export const fetchLatestDependencies = () => axios.get(`${BASE}/feed/latest-dependencies`);
