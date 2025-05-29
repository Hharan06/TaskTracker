import React from 'react';
import { Link } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = ({ onLogout }) => (
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
                        <Link className="nav-link" to="/profile">Profile</Link>
                    </li>
                    <li className="nav-item ">
                        <Link className="nav-link active" to="/tasks">Tasks</Link>
                    </li>
                </ul>
                <NotificationDropdown />
                <button onClick={onLogout} className="btn btn-outline-danger ms-lg-3 mt-2 mt-lg-0">Logout</button>
            </div>
        </div>
    </nav>
);

export default Navbar;
