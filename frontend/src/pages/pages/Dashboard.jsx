import { useEffect, useState } from "react";
import BackButton from "../../components/BackButton";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function Dashboard() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = () => {
      fetch("http://127.0.0.1:8000/history")
        .then((res) => res.json())
        .then((data) => setHistory(data.history || []))
        .catch(() => setHistory([]));
    };

    loadHistory();

    const handleHistoryUpdate = () => loadHistory();
    window.addEventListener("candidate-history-updated", handleHistoryUpdate);

    return () => {
      window.removeEventListener("candidate-history-updated", handleHistoryUpdate);
    };
  }, []);

  const totalCandidates = history.length;
  const shortlisted = history.filter((entry) => entry.status === "Selected").length;
  const rejected = history.filter((entry) => entry.status === "Rejected").length;
  const averageScore = history.length
    ? (history.reduce((sum, entry) => sum + entry.resume_score, 0) / history.length).toFixed(1)
    : "0.0";

  const scoreData = [
    { range: "0-59", count: history.filter((entry) => entry.resume_score < 60).length },
    { range: "60-74", count: history.filter((entry) => entry.resume_score >= 60 && entry.resume_score < 75).length },
    { range: "75-84", count: history.filter((entry) => entry.resume_score >= 75 && entry.resume_score < 85).length },
    { range: "85-100", count: history.filter((entry) => entry.resume_score >= 85).length },
  ];

  const statusData = [
    { name: "Selected", value: shortlisted, color: "#4ade80" },
    { name: "Review", value: history.filter((entry) => entry.status === "Review").length, color: "#fbbf24" },
    { name: "Rejected", value: rejected, color: "#f87171" },
  ];

  const dashboardCards = [
    { title: "Total Candidates", value: totalCandidates.toString(), detail: "Across all uploaded resumes" },
    { title: "Shortlisted", value: shortlisted.toString(), detail: "Ready for review" },
    { title: "Rejected", value: rejected.toString(), detail: "Needs follow-up" },
    { title: "Average Score", value: `${averageScore}`, detail: "Overall candidate quality" },
  ];

  const rankedHistory = [...history].sort((a, b) => b.resume_score - a.resume_score);

  return (
    <div className="dashboard-page">
      <BackButton />
      <h1>Recruitment Dashboard</h1>

      <div className="dashboard-grid">
        {dashboardCards.map((card) => (
          <div className="dashboard-card" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.value}</p>
            <span>{card.detail}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", marginTop: "24px" }}>
        <div style={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "16px", padding: "20px", boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)" }}>
          <h2 style={{ color: "#f8fafc", marginBottom: "12px" }}>Candidate Score Distribution</h2>
          <div style={{ width: "100%", height: "260px" }}>
            <ResponsiveContainer>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="range" stroke="#cbd5e1" tickLine={false} axisLine={false} />
                <YAxis stroke="#cbd5e1" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.1)" }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: "16px", padding: "20px", boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)" }}>
          <h2 style={{ color: "#f8fafc", marginBottom: "12px" }}>Hiring Status</h2>
          <div style={{ width: "100%", height: "260px" }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="ranking-table" style={{ marginTop: "28px" }}>
        <h2>Candidate Ranking</h2>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Candidate Name</th>
              <th>Resume Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rankedHistory.length > 0 ? (
              rankedHistory.map((entry, index) => (
                <tr key={`${entry.candidate_name}-${index}`}>
                  <td>#{index + 1}</td>
                  <td>{entry.candidate_name}</td>
                  <td>{entry.resume_score}/100</td>
                  <td>{entry.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No ranked candidates yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="ranking-table" style={{ marginTop: "32px" }}>
        <h2>Candidate History</h2>
        <table>
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Resume Score</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history.map((entry, index) => (
                <tr key={`${entry.candidate_name}-${index}`}>
                  <td>{entry.candidate_name}</td>
                  <td>{entry.resume_score}/100</td>
                  <td>{entry.date}</td>
                  <td>{entry.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No candidate history yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;