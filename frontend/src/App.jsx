import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/pages/Home";
import Analyzer from "./pages/pages/Analyzer";
import Dashboard from "./pages/pages/Dashboard";
import About from "./pages/pages/About";
import Login from "./pages/pages/Login";
import Register from "./pages/pages/Register";
import Admin from "./pages/pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/analyzer" element={<Analyzer />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/about" element={<About />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;