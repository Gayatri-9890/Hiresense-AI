import { useNavigate } from "react-router-dom";

function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/")}
      className="back-button"
    >
      ← Back to Home
    </button>
  );
}

export default BackButton;
