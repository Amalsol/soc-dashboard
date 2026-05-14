import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://cowrie-func-pfe.azurewebsites.net/api";

const scoreLevel = (score) => {
  if (score >= 70) return "critical";
  if (score >= 30) return "suspect";
  return "safe";
};

export default function App() {
  const [logs, setLogs] = useState([]);

  async function fetchLogs() {
    try {
      const res = await axios.get(`${API_URL}/get_logs`);
      const data = Array.isArray(res.data) ? [...res.data].reverse() : [];
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  }

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: logs.length,
    critical: logs.filter((l) => l.risk_score >= 70).length,
    suspect: logs.filter((l) => l.risk_score >= 30 && l.risk_score < 70).length,
    safe: logs.filter((l) => l.risk_score < 30).length,
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <p style={styles.headerLabel}>Security Operations Center</p>
          <h1 style={styles.headerTitle}>Event Monitor</h1>
        </div>
        <div style={styles.livePill}>
          <span style={styles.liveDot} />
          Live — 2s interval
        </div>
      </header>

      <div style={styles.statsGrid}>
        {[
          { label: "Total events", value: stats.total, color: "inherit" },
          { label: "Critical ≥70", value: stats.critical, color: "#c0392b" },
          { label: "Suspect 30–69", value: stats.suspect, color: "#d68910" },
          { label: "Safe <30", value: stats.safe, color: "#1e8449" },
        ].map(({ label, value, color }) => (
          <div key={label} style={styles.statBox}>
            <p style={{ ...styles.statValue, color }}>{value}</p>
            <p style={styles.statLabel}>{label}</p>
          </div>
        ))}
      </div>

      <div style={styles.tableWrapper}>
        <div style={styles.tableHeader}>
          {["Type", "Source IP", "Command / User", "Alert", "Score", "Timestamp"].map((col) => (
            <div key={col} style={styles.th}>{col}</div>
          ))}
        </div>

        {logs.length === 0 ? (
          <p style={styles.empty}>Awaiting events…</p>
        ) : (
          logs.map((log, i) => {
            const level = scoreLevel(log.risk_score);
            const accentColor =
              level === "critical" ? "#c0392b" :
              level === "suspect"  ? "#d68910" : "#1e8449";

            return (
              <div key={i} style={{ ...styles.row, borderLeft: `2px solid ${accentColor}` }}>
                <div style={styles.td}>
                  <span style={styles.eventType}>
                    {(log.event_type || "—").replace("_", " ")}
                  </span>
                </div>

                <div style={styles.td}>
                  <code style={styles.mono}>{log.src_ip || "—"}</code>
                </div>

                <div style={{ ...styles.td, ...styles.overflow }}>
                  <code style={styles.mono}>
                    {log.command || log.username || "—"}
                  </code>
                </div>

                <div style={{ ...styles.td, ...styles.overflow }}>
                  {log.alerts && log.alerts !== "" ? (
                    <span style={styles.alertText}>{log.alerts}</span>
                  ) : (
                    <span style={styles.muted}>—</span>
                  )}
                </div>

                <div style={styles.td}>
                  <span style={{ ...styles.scoreValue, color: accentColor }}>
                    {log.risk_score}
                  </span>
                  <div style={styles.scoreBarTrack}>
                    <div
                      style={{
                        ...styles.scoreBarFill,
                        width: `${log.risk_score}%`,
                        background: accentColor,
                      }}
                    />
                  </div>
                </div>

                <div style={styles.td}>
                  <span style={styles.timestamp}>
                    {log.timestamp || "—"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#f9f9f8",
    minHeight: "100vh",
    padding: "2rem 2.5rem",
    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    color: "#1a1a1a",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: "1.25rem",
    borderBottom: "1px solid #e0e0e0",
    marginBottom: "1.5rem",
  },
  headerLabel: {
    fontSize: "11px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#888",
    margin: 0,
  },
  headerTitle: {
    fontSize: "22px",
    fontWeight: 500,
    margin: "4px 0 0",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  livePill: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    color: "#888",
  },
  liveDot: {
    display: "inline-block",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#27ae60",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1px",
    background: "#e0e0e0",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    overflow: "hidden",
    marginBottom: "1.5rem",
  },
  statBox: {
    background: "#ffffff",
    padding: "1rem 1.25rem",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 500,
    margin: 0,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "11px",
    color: "#888",
    marginTop: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    margin: "6px 0 0",
  },
  tableWrapper: {
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    overflow: "hidden",
    background: "#ffffff",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "100px 130px 1fr 1fr 80px 140px",
    background: "#f4f4f2",
    borderBottom: "1px solid #e0e0e0",
  },
  th: {
    padding: "9px 14px",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 500,
    color: "#888",
    borderRight: "1px solid #e8e8e8",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "100px 130px 1fr 1fr 80px 140px",
    borderBottom: "1px solid #f0f0f0",
    alignItems: "center",
  },
  td: {
    padding: "10px 14px",
    fontSize: "12px",
    borderRight: "1px solid #f0f0f0",
    overflow: "hidden",
  },
  overflow: {
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  mono: {
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontSize: "12px",
    color: "#333",
    background: "none",
  },
  eventType: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#555",
  },
  alertText: {
    fontSize: "11px",
    color: "#c0392b",
  },
  muted: {
    color: "#bbb",
  },
  scoreValue: {
    fontFamily: "'SF Mono', monospace",
    fontSize: "13px",
    fontWeight: 500,
  },
  scoreBarTrack: {
    height: "2px",
    background: "#eee",
    borderRadius: "1px",
    marginTop: "4px",
  },
  scoreBarFill: {
    height: "2px",
    borderRadius: "1px",
  },
  timestamp: {
    fontSize: "10px",
    color: "#aaa",
    fontFamily: "'SF Mono', monospace",
  },
  empty: {
    textAlign: "center",
    padding: "3rem",
    fontSize: "13px",
    color: "#bbb",
  },
};