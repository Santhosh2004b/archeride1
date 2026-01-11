import axios from "axios";
import { BASE_URL } from "./http";

const getAuthHeaders = () => {
    const stored = localStorage.getItem("archeride_auth");
    if (!stored) return {};
    const { token } = JSON.parse(stored);
    return { Authorization: `Bearer ${token}` };
};

export const fetchUsers = async () => {
    const res = await axios.get(`${BASE_URL}/users`, { headers: getAuthHeaders() });
    return res.data.data;
};

export const assignProjectsToUser = async (userId, projectIds) => {
    const res = await axios.post(
        `${BASE_URL}/users/${userId}/projects`,
        { projectIds },
        { headers: getAuthHeaders() }
    );
    return res.data;
};
