import { useState } from "react";
import BackButton from "../../components/BackButton";

function Analyzer() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState("");

  const updateSelectedFiles = (selectedFiles) => {
    setFiles(Array.from(selectedFiles || []));
    setMessage("");
  };

  const handleUpload = async () => {
    if (!files.length) {
      setMessage("Please select at least one PDF file");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/upload-resume/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || "Analysis failed");
      }

      setResult(data);
      window.dispatchEvent(new CustomEvent("candidate-history-updated"));
      setMessage(`Analyzed ${data.total_candidates || files.length} candidate(s) successfully.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const topCandidate = result?.candidate_ranking?.[0];

  const handleDownloadReport = async () => {
    if (!topCandidate?.db_id) {
      setMessage("No report is available for this candidate yet.");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/generate-report/${topCandidate.db_id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${topCandidate.name || "candidate"}-report.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage("Unable to download report right now.");
    }
  };

  return (
    <div className="analyzer-page">
      <BackButton />
      <h1>AI Resume Analyzer</h1>
      <p>Upload multiple candidate resumes and rank them instantly</p>

      <div
        className={`upload-box ${dragActive ? "drag-active" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          updateSelectedFiles(event.dataTransfer.files);
        }}
      >
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={(e) => updateSelectedFiles(e.target.files)}
        />

        <p className="upload-hint">Drag and drop PDF files here or browse your device.</p>

        {files.length > 0 && (
          <div className="selected-files">
            <h3>Selected Files</h3>
            <ul>
              {files.map((file) => (
                <li key={file.name}>
                  {file.name} <span>({Math.round(file.size / 1024)} KB)</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {message && <p className="upload-message">{message}</p>}

        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze All Resumes"}
        </button>
      </div>

      {loading && <h2 className="loading-text">AI analyzing resumes...</h2>}

      {result && (
        <div className="results-section">
          <div className="result-card">
            <h3>Top Candidate Score</h3>
            <p>{topCandidate?.analysis?.score ?? "N/A"}/100</p>
          </div>

          <div className="result-card">
            <h3>Job Match</h3>
            <p>{topCandidate?.job_match?.match_score ?? "N/A"}%</p>
          </div>

          <div className="result-card">
            <h3>Evaluation</h3>
            <p>{topCandidate?.evaluation?.evaluation ?? "N/A"}</p>
          </div>

          <div className="result-card">
            <h3>Candidate Ranking</h3>
            <p>{result.total_candidates ?? 0} ranked candidates</p>
          </div>
        </div>
      )}

      {topCandidate?.db_id && (
        <button className="download-btn" onClick={handleDownloadReport}>
          Download PDF Report
        </button>
      )}

      {topCandidate?.feedback && (
        <div className="result-card" style={{ margin: "24px auto", maxWidth: "800px", textAlign: "left" }}>
          <h3>AI Resume Feedback</h3>
          <p><strong>Resume Score:</strong> {topCandidate.feedback.score}/100</p>
          <p style={{ marginTop: "10px" }}><strong>Weak Areas:</strong></p>
          <ul>
            {(topCandidate.feedback.weak_areas || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p style={{ marginTop: "10px" }}><strong>AI Suggestions:</strong></p>
          <ul>
            {(topCandidate.feedback.suggestions || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {result?.candidate_ranking?.length > 0 && (
        <div className="ranking-table" style={{ marginTop: "24px" }}>
          <h2>Ranked Candidates</h2>
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
              {result.candidate_ranking.map((candidate, index) => (
                <tr key={candidate.name}>
                  <td>#{index + 1}</td>
                  <td>{candidate.name}</td>
                  <td>{candidate.score}/100</td>
                  <td>{candidate.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Analyzer;