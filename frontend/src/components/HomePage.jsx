import React from "react";
import { Link } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";

function HomePage({ onLogout }) {
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
                <Link className="nav-link active" aria-current="page" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/profile">Profile</Link>
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

      {/* Welcome message */}
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h2 className="mb-3">Welcome!</h2>
                <p>You are logged in. Use the navigation bar to explore your account.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
