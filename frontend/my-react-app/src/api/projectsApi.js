import axios from "axios";
import { BASE_URL } from "./http";

const getAuthHeaders = () => {
    const stored = localStorage.getItem("archeride_auth");
    if (!stored) return {};
    const { token } = JSON.parse(stored);
    return { Authorization: `Bearer ${token}` };
};

export const searchProjects = async (name) => {
    const res = await axios.get(`${BASE_URL}/projects?name=${name}`, { headers: getAuthHeaders() });
    return res.data;
};
