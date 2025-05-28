import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_URL = "http://localhost:8080/api/auth";

function RegisterForm() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post(`${API_URL}/register`, form);
      setMessage("Registration successful! You can now log in.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setMessage(
        err.response?.data?.message || err.response?.data || "Registration failed"
      );
    }
  };

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center">
      <div className="row w-100">
        <div className="col-md-6 col-lg-4 mx-auto">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="mb-4 text-center">Register</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="registerUsername" className="form-label">Username</label>
                  <input
                    name="username"
                    id="registerUsername"
                    className="form-control"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="registerEmail" className="form-label">Email</label>
                  <input
                    name="email"
                    type="email"
                    id="registerEmail"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="registerPassword" className="form-label">Password</label>
                  <input
                    name="password"
                    type="password"
                    id="registerPassword"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">Register</button>
              </form>
              <div className="mt-3 text-center">
                <Link to="/login">Already have an account? Login</Link>
              </div>
              {message && (
                <div className={`mt-3 text-center ${message.startsWith("Registration successful") ? "text-success" : "text-danger"}`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
