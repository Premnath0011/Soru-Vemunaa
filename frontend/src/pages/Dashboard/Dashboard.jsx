import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiFolder,
  FiCreditCard,
  FiBarChart2,
  FiArrowUpRight,
  FiArrowDownLeft,
} from "react-icons/fi";
import Header from "../../components/Header";
import { getTransactions } from "../../services/transactionService";
import { getProjects } from "../../services/projectService";
import { money, dateText } from "../../utils/format";
import { useAuth } from "../../context";
export default function Dashboard() {
  const nav = useNavigate(),
    { user } = useAuth(),
    [tx, setTx] = useState([]),
    [projects, setProjects] = useState([]),
    [err, setErr] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([getTransactions(), getProjects()])
      .then(([t, p]) => {
        setTx(t);
        setProjects(p);
      })
      .catch((e) =>
        setErr(e.response?.data?.message || "Could not load dashboard data."),
      )
      .finally(() => setLoading(false));
  }, []);
  const income = tx
      .filter((x) => x.type === "income")
      .reduce((s, x) => s + Number(x.amount || 0), 0),
    expense = tx
      .filter((x) => x.type === "expense")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  return (
    <>
      <Header
        title={user?.channelName || "Soru venumaa"}
        subtitle="Create • Track • Grow"
        menu
        brand
      />
      <div style={{ margin: "4px 2px 14px" }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>
          Good{" "}
          {new Date().getHours() < 12
            ? "Morning"
            : new Date().getHours() < 17
              ? "Afternoon"
              : "Evening"}{" "}
          👋
        </div>
        <div className="subtle" style={{ marginTop: 4 }}>
          Here’s your creator business at a glance.
        </div>
      </div>
      {err && <div className="error-box">{err}</div>}
      <div className="balance-card">
        <div className="label">Current Balance</div>
        <div className="balance">{money(income - expense)}</div>
        <div className="stats-row">
          <div className="stat">
            <strong>{money(income)}</strong>
            <small>Total Income</small>
          </div>
          <div className="stat">
            <strong>{money(expense)}</strong>
            <small>Total Expenses</small>
          </div>
        </div>
      </div>
      <div className="quick-grid">
        <button className="quick" onClick={() => nav("/projects")}>
          <div className="quick-icon">
            <FiFolder />
          </div>
          Projects
        </button>
        <button className="quick" onClick={() => nav("/money?add=income")}>
          <div className="quick-icon">₹</div>Money
        </button>
        <button className="quick" onClick={() => nav("/ideas")}>
          <div className="quick-icon">
            <FiBarChart2 />
          </div>
          Ideas
        </button>
        <button className="quick" onClick={() => nav("/reports")}>
          <div className="quick-icon">
            <FiBarChart2 />
          </div>
          Reports
        </button>
      </div>
      <div className="section-head">
        <h2>Recent Transactions</h2>
        <button className="link-btn" onClick={() => nav("/money")}>
          View all
        </button>
      </div>
      {loading ? (
        <div className="list-card empty">Loading…</div>
      ) : (
        tx.slice(0, 5).map((x) => (
          <div className="list-card transaction" key={x._id}>
            <div className="avatar-icon">
              {x.type === "income" ? <FiArrowDownLeft /> : <FiArrowUpRight />}
            </div>
            <div className="tx-main">
              <div className="tx-title">{x.title}</div>
              <div className="tx-sub">
                {x.projectId?.title || x.category || "General"} •{" "}
                {dateText(x.date)}
              </div>
            </div>
            <div className={`tx-amount ${x.type}`}>
              {x.type === "income" ? "+" : "-"} {money(x.amount)}
            </div>
          </div>
        ))
      )}
      {!loading && !tx.length && (
        <div className="list-card empty">No transactions yet.</div>
      )}
      <div className="section-head">
        <h2>Projects</h2>
        <button className="link-btn" onClick={() => nav("/projects")}>
          {projects.length} total
        </button>
      </div>
      {projects.slice(0, 3).map((p) => (
        <div className="project-card" key={p._id}>
          <div className="thumb">
            {p.thumbnail ? <img src={p.thumbnail} alt="" /> : <FiFolder />}
          </div>
          <div className="project-body">
            <div className="project-title">{p.title}</div>
            <div className="project-desc">
              {p.platform} • {p.promotionType}
            </div>
            <span className="badge-soft ongoing">{p.status}</span>
          </div>
        </div>
      ))}
      {!projects.length && (
        <div className="list-card empty">
          No projects yet. Create your first food review project.
        </div>
      )}
    </>
  );
}
