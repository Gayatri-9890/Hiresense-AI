import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="logo">HireSense AI</div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/analyzer">Analyzer</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>

      <div className="nav-buttons">
        {user ? (
          <>
            <span className="user-badge">{user.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;