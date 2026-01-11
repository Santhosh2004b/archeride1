// frontend/my-react-app/src/pages/UsersMonitoringPage.jsx
import React, { useEffect, useState } from "react";
import { fetchUsers, assignProjectsToUser } from "../api/usersApi";
import { searchProjects } from "../api/projectsApi";
import { Users, PencilSimple, Check, X, Shield, ProjectorScreenChart } from "phosphor-react";

const UsersMonitoringPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUserId, setEditingUserId] = useState(null);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [projectSearch, setProjectSearch] = useState("");
    const [projectResults, setProjectResults] = useState([]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (err) {
            console.error("Failed to load users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUserId(user.id);
        setSelectedProjects(user.projects || []);
        setProjectSearch("");
        setProjectResults([]);
    };

    const handleCancel = () => {
        setEditingUserId(null);
        setSelectedProjects([]);
    };

    const handleProjectSearch = async (val) => {
        setProjectSearch(val);
        if (val.length < 2) {
            setProjectResults([]);
            return;
        }
        try {
            const results = await searchProjects(val);
            setProjectResults(results.filter(p => !selectedProjects.find(sp => sp.id === p.id)));
        } catch (err) {
            console.error("Project search error", err);
        }
    };

    const addProject = (project) => {
        setSelectedProjects([...selectedProjects, project]);
        setProjectSearch("");
        setProjectResults([]);
    };

    const removeProject = (projectId) => {
        setSelectedProjects(selectedProjects.filter(p => p.id !== projectId));
    };

    const handleSave = async (userId) => {
        try {
            await assignProjectsToUser(userId, selectedProjects.map(p => p.id));
            setEditingUserId(null);
            loadUsers();
        } catch (err) {
            console.error("Failed to save projects", err);
            alert("Failed to save assignments");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandDark"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-marcellus font-bold text-gray-900 flex items-center gap-3">
                        <Users size={32} weight="fill" className="text-brandDark" />
                        User Management
                    </h1>
                    <p className="text-brandMuted text-sm mt-1">Manage user project assignments and roles</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-semibold text-brandMuted uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-xs font-semibold text-brandMuted uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-xs font-semibold text-brandMuted uppercase tracking-wider">Assigned Projects</th>
                            <th className="px-6 py-4 text-xs font-semibold text-brandMuted uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-brandDark/5 flex items-center justify-center text-brandDark font-bold text-lg">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{user.name}</div>
                                            <div className="text-xs text-brandMuted">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                                        }`}>
                                        <Shield size={14} />
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {editingUserId === user.id ? (
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProjects.map(p => (
                                                    <span key={p.id} className="inline-flex items-center gap-1 px-2 py-1 bg-brandDark text-white text-[10px] rounded-md">
                                                        {p.name}
                                                        <button onClick={() => removeProject(p.id)} className="hover:text-red-300">
                                                            <X size={12} weight="bold" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="relative max-w-xs">
                                                <input
                                                    type="text"
                                                    placeholder="Search project to add..."
                                                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-brandDark outline-none"
                                                    value={projectSearch}
                                                    onChange={(e) => handleProjectSearch(e.target.value)}
                                                />
                                                {projectResults.length > 0 && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden animate-slide-up">
                                                        {projectResults.map(p => (
                                                            <button
                                                                key={p.id}
                                                                onClick={() => addProject(p)}
                                                                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-50"
                                                            >
                                                                <div className="font-medium text-gray-900">{p.name}</div>
                                                                <div className="text-[10px] text-brandMuted">{p.account}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {user.projects && user.projects.length > 0 ? (
                                                user.projects.map(p => (
                                                    <span key={p.id} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded-md border border-gray-200">
                                                        <ProjectorScreenChart size={12} />
                                                        {p.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-brandMuted italic">No projects assigned</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {editingUserId === user.id ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleSave(user.id)}
                                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                title="Save changes"
                                            >
                                                <Check size={18} weight="bold" />
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                                                title="Cancel"
                                            >
                                                <X size={18} weight="bold" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="p-2 text-brandMuted hover:text-brandDark hover:bg-brandDark/5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Edit Assignments"
                                        >
                                            <PencilSimple size={20} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersMonitoringPage;
