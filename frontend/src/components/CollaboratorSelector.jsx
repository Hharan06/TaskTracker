import React, { useState, useEffect } from "react";
import axios from "axios";

const CollaboratorSelector = ({ onChange }) => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        if (query.length === 0) {
            setSuggestions([]);
            return;
        }

        const delayDebounce = setTimeout(() => {
            axios
                .get(`/api/users/search?query=${encodeURIComponent(query)}`)
                .then((res) => {
                    const filtered = res.data.filter(
                        (user) => !selectedUsers.some((u) => u.user_id === user.id)
                    );
                    setSuggestions(filtered);
                })
                .catch(console.error);
        }, 300); // debounce

        return () => clearTimeout(delayDebounce);
    }, [query, selectedUsers]);

    const handleSelect = (user) => {
        const updated = [...selectedUsers, user];
        setSelectedUsers(updated);
        setQuery("");
        setSuggestions([]);
        onChange(updated.map((u) => u.user_id));
    };


    const handleRemove = (id) => {
        const updated = selectedUsers.filter((u) => u.user_id !== id);
        setSelectedUsers(updated);
        onChange(updated.map((u) => u.user_id));
    };

    return (
        <div className="collaborator-selector" style={{ position: "relative" }}>
            <label>Add Collaborators:</label>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type username..."
                style={{ width: "100%", padding: "8px" }}
            />

            {suggestions.length > 0 && (
                <ul
                    style={{
                        position: "absolute",
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        listStyle: "none",
                        margin: 0,
                        padding: "0.5rem",
                        width: "100%",
                        zIndex: 5,
                    }}
                >
                    {suggestions.map((user) => (
                        <li
                            key={user.user_id}
                            onClick={() => handleSelect(user)}
                            style={{
                                padding: "5px",
                                cursor: "pointer",
                                borderBottom: "1px solid #eee",
                            }}
                        >
                            {user.username}
                        </li>
                    ))}
                </ul>
            )}

            <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {selectedUsers.map((user) => (
                    <div
                        key={user.user_id}
                        style={{
                            backgroundColor: "#eee",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        {user.username}
                        <button
                            onClick={() => handleRemove(user.user_id)}
                            style={{
                                marginLeft: "8px",
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                fontWeight: "bold",
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CollaboratorSelector;
