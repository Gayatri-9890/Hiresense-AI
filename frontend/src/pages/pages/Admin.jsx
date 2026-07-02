import { useEffect, useMemo, useState } from "react";
import BackButton from "../../components/BackButton";

function Admin() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/all-candidates");
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch (error) {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch = candidate.candidate_name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || candidate.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [candidates, search, statusFilter]);

  const updateStatus = async (candidateId, status) => {
    try {
      await fetch(`http://127.0.0.1:8000/update-status/${candidateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      loadCandidates();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCandidate = async (candidateId) => {
    try {
      await fetch(`http://127.0.0.1:8000/delete-candidate/${candidateId}`, {
        method: "DELETE",
      });
      loadCandidates();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="dashboard-page">
      <BackButton />
      <h1>Admin Panel</h1>
      <p>Manage candidate workflow, approvals, and rejections.</p>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", margin: "24px 0" }}>
        <input
          type="text"
          placeholder="Search candidate by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.9)", color: "white", minWidth: "260px" }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.9)", color: "white" }}
        >
          <option value="All">All Status</option>
          <option value="Selected">Selected</option>
          <option value="Review">Review</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="ranking-table">
        <table>
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Resume Score</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">Loading candidates...</td>
              </tr>
            ) : filteredCandidates.length > 0 ? (
              filteredCandidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.candidate_name}</td>
                  <td>{candidate.resume_score}/100</td>
                  <td>{candidate.date}</td>
                  <td>{candidate.status}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button onClick={() => updateStatus(candidate.id, "Selected")}>Approve</button>
                      <button onClick={() => updateStatus(candidate.id, "Rejected")}>Reject</button>
                      <button onClick={() => deleteCandidate(candidate.id)} style={{ background: "#ef4444" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No candidates found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;
