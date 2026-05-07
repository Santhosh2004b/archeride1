import axios from "axios";
import { BASE_URL } from "./http";

const getAuthHeaders = () => {
    const stored = localStorage.getItem("ARCHERIDE_AUTH");
    if (!stored) return {};
    const { token } = JSON.parse(stored);
    return { Authorization: `Bearer ${token}` };
};

export const searchProjects = async (name) => {
    const res = await axios.get(`${BASE_URL}/projects?name=${name}`, { headers: getAuthHeaders() });
    return res.data;
};

export const createProject = async (data) => {
    const res = await axios.post(`${BASE_URL}/projects`, data, { headers: getAuthHeaders() });
    return res.data;
};

export const fetchProjectHistory = async () => {
    const res = await axios.get(`${BASE_URL}/projects/history`, { headers: getAuthHeaders() });
    return res.data;
};
