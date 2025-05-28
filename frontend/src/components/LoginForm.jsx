import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_URL = "http://localhost:8080/api/auth";

function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(`${API_URL}/login`, {
        username: form.username,
        password: form.password,
      });
      onLogin(res.data);
      setMessage("Login successful!");
      navigate("/");
    } catch (err) {
      setMessage(
        err.response?.data?.message || err.response?.data || "Login failed"
      );
    }
  };

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center">
      <div className="row w-100">
        <div className="col-md-6 col-lg-4 mx-auto">
          <div className="card shadow-sm mt-5">
            <div className="card-body">
              <h2 className="mb-4 text-center">Login</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="loginUsername" className="form-label">Username</label>
                  <input
                    name="username"
                    id="loginUsername"
                    className="form-control"
                    value={form.username}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="loginPassword" className="form-label">Password</label>
                  <input
                    name="password"
                    type="password"
                    id="loginPassword"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">Login</button>
              </form>
              <div className="mt-3 text-center">
                <Link to="/register">Need an account? Register</Link>
              </div>
              {message && <div className="mt-3 text-danger text-center">{message}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
