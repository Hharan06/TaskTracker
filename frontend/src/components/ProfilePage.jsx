import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function ProfilePage({ token, onLogout }) {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    const payload = parseJwt(token);

    if (!payload?.sub) {
      setMessage("Invalid token format");
      return;
    }

    const userId = payload.sub;

    axios
      .get(`http://localhost:8080/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("Profile fetch error:", err);
        setMessage("Failed to fetch profile");
      });
  }, [token]);

  return (
    <>
      {/* Bootstrap Navbar */}
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">TaskTracker</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                  aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link " aria-current="page" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/profile">Profile</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/tasks">Tasks</Link>
              </li>

              {/* Add more nav items as needed */}
            </ul>
            <NotificationDropdown/>
            <button onClick={onLogout} className="btn btn-outline-danger ms-lg-3 mt-2 mt-lg-0">Logout</button>
          </div>
        </div>
      </nav>

      {/* Profile Card */}
      <div className="container min-vh-100 d-flex justify-content-center align-items-start">
        <div className="row w-100">
          <div className="col-md-6 col-lg-4 mx-auto">
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="mb-1 text-center">Profile</h2>
                {message && (
                  <div className="alert alert-danger text-center">{message}</div>
                )}
                {!message && !user && (
                  <div className="text-center">Loading...</div>
                )}
                {user && (
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                      <strong>Username:</strong> {user.username}
                    </li>
                    <li className="list-group-item">
                      <strong>Email:</strong> {user.email}
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
