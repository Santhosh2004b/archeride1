import React, { useState, useEffect, useRef } from 'react';
import { searchProjects } from '../api/projectsApi';
import './ProjectSearchInput.css'; 

const ProjectSearchInput = ({ value, onChange, onSelect, placeholder, required, className }) => {
    const [query, setQuery] = useState(value || '');
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSearch = async (input) => {
        setQuery(input);
        onChange(input); 

        if (input.length > 1) {
            setLoading(true);
            try {
                const data = await searchProjects(input);
                setResults(data);
                setShowDropdown(true);
            } catch (error) {
                console.error("Error searching projects:", error);
            } finally {
                setLoading(false);
            }
        } else {
            setResults([]);
            setShowDropdown(false);
        }
    };

    const handleSelect = (project) => {
        setQuery(project.name);
        setShowDropdown(false);
        onSelect(project);
    };

    return (
        <div className="project-search-container" ref={wrapperRef}>
            <input
                type="text"
                className={className || "form-control"}
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={placeholder || "Search Project ID..."}
                required={required}
            />
            {showDropdown && (
                <ul className="project-search-results">
                    {loading ? (
                        <li className="search-loading">Loading...</li>
                    ) : results.length > 0 ? (
                        results.map((project) => (
                            <li key={project.id} onClick={() => handleSelect(project)}>
                                <strong>{project.name}</strong> - {project.description}
                            </li>
                        ))
                    ) : (
                        <li className="no-results">No projects found</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default ProjectSearchInput;
