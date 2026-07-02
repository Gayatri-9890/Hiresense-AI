import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    setMessage(data.message || data.detail || "Login failed");

    if (response.ok) {
      setUser({ email: form.email });
      navigate("/dashboard");
    }
  };

  return (
    <div className="auth-page">
      <BackButton />
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p>Sign in to HireSense AI</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-link">
          New here? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;