import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import TaskList from "./components/TaskList";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [token, setToken] = useState(localStorage.getItem("token") || "");

    const handleLogin = (jwt) => {
        setToken(jwt);
        localStorage.setItem("token", jwt);
    };

    const handleLogout = () => {
        setToken("");
        localStorage.removeItem("token");
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={token ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" />} />
                <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute token={token}>
                            <ProfilePage token={token} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/tasks"
                    element={
                        <ProtectedRoute token={token}>
                            <TaskList onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
            </Routes>
        </Router>
    );
}

export default App;
