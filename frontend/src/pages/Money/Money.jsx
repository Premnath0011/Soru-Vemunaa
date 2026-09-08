import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiFilter,
  FiX,
} from "react-icons/fi";
import Header from "../../components/Header";
import Modal from "../../components/Modal";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../../services/transactionService";
import { getProjects } from "../../services/projectService";
import { getCategories } from "../../services/categoryService";
import { money, dateText } from "../../utils/format";
const today = new Date().toISOString().slice(0, 10),
  blank = {
    type: "income",
    title: "",
    amount: "",
    category: "",
    projectId: "",
    date: today,
    notes: "",
  };
export default function Money() {
  const [params, setParams] = useSearchParams(),
    [tx, setTx] = useState([]),
    [projects, setProjects] = useState([]),
    [cats, setCats] = useState([]),
    [filters, setFilters] = useState({
      type: "All",
      category: "All",
      projectId: "All",
      from: "",
      to: "",
    }),
    [filterOpen, setFilterOpen] = useState(false),
    [open, setOpen] = useState(false),
    [form, setForm] = useState(blank),
    [editing, setEditing] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      setLoading(true);
      const [t, p, c] = await Promise.all([
        getTransactions(),
        getProjects(),
        getCategories(),
      ]);
      setTx(t);
      setProjects(p);
      setCats(c);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load money data.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    const add = params.get("add");
    if (add) {
      const type = add === "expense" ? "expense" : "income";
      setForm({
        ...blank,
        type,
        category: (cats.find((c) => c.type === type) || {}).name || "",
      });
      setOpen(true);
      setParams({}, { replace: true });
    }
  }, [params, setParams, cats]);
  const income = useMemo(
      () =>
        tx
          .filter((x) => x.type === "income")
          .reduce((s, x) => s + Number(x.amount || 0), 0),
      [tx],
    ),
    expense = useMemo(
      () =>
        tx
          .filter((x) => x.type === "expense")
          .reduce((s, x) => s + Number(x.amount || 0), 0),
      [tx],
    );
  const visible = tx.filter(
    (x) =>
      (filters.type === "All" || x.type === filters.type) &&
      (filters.category === "All" || x.category === filters.category) &&
      (filters.projectId === "All" ||
        (x.projectId?._id || x.projectId) === filters.projectId) &&
      (!filters.from || x.date.slice(0, 10) >= filters.from) &&
      (!filters.to || x.date.slice(0, 10) <= filters.to),
  );
  const submit = async (e) => {
    e.preventDefault();
    try {
      const p = {
        ...form,
        amount: Number(form.amount),
        projectId: form.projectId || null,
      };
      editing
        ? await updateTransaction(editing, p)
        : await createTransaction(p);
      setOpen(false);
      setEditing(null);
      setForm(blank);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not save transaction.");
    }
  };
  const edit = (x) => {
    setEditing(x._id);
    setForm({
      type: x.type,
      title: x.title,
      amount: x.amount,
      category: x.category,
      projectId: x.projectId?._id || "",
      date: x.date.slice(0, 10),
      notes: x.notes || "",
    });
    setOpen(true);
  };
  return (
    <>
      <Header title="Money" subtitle="Track your income & expenses" />
      <div className="money-card glass">
        <div className="subtle">Current Balance</div>
        <div className="money-number">{money(income - expense)}</div>
        <div className="money-stats">
          <div className="money-stat">
            <div className="income">↓</div>
            <small className="subtle">Total Income</small>
            <strong>{money(income)}</strong>
          </div>
          <div className="money-stat">
            <div className="expense">↑</div>
            <small className="subtle">Total Expenses</small>
            <strong>{money(expense)}</strong>
          </div>
        </div>
      </div>
      <div className="action-row">
        <button
          className="income-btn"
          onClick={() => {
            setEditing(null);
            setForm({
              ...blank,
              type: "income",
              category: cats.find((c) => c.type === "income")?.name || "",
            });
            setOpen(true);
          }}
        >
          <FiPlus /> Add Income
        </button>
        <button
          className="expense-btn"
          onClick={() => {
            setEditing(null);
            setForm({
              ...blank,
              type: "expense",
              category: cats.find((c) => c.type === "expense")?.name || "",
            });
            setOpen(true);
          }}
        >
          <FiPlus /> Add Expense
        </button>
      </div>
      <div className="tabs">
        <button
          className={`tab ${filters.type === "All" ? "active" : ""}`}
          onClick={() => setFilters({ ...filters, type: "All" })}
        >
          All
        </button>
        <button
          className={`tab ${filters.type === "income" ? "active" : ""}`}
          onClick={() => setFilters({ ...filters, type: "income" })}
        >
          Income
        </button>
        <button
          className={`tab ${filters.type === "expense" ? "active" : ""}`}
          onClick={() => setFilters({ ...filters, type: "expense" })}
        >
          Expense
        </button>
        <button
          className="tab active"
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <FiFilter /> Filters
        </button>
      </div>
      {filterOpen && (
        <div className="filter-card glass">
          <div className="section-head">
            <h2>Filter Transactions</h2>
            <button className="icon-btn" onClick={() => setFilterOpen(false)}>
              <FiX />
            </button>
          </div>
          <div className="two">
            <div className="field">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
              >
                <option>All</option>
                {cats
                  .filter(
                    (c) => filters.type === "All" || c.type === filters.type,
                  )
                  .map((c) => (
                    <option key={c._id}>{c.name}</option>
                  ))}
              </select>
            </div>
            <div className="field">
              <label>Project</label>
              <select
                value={filters.projectId}
                onChange={(e) =>
                  setFilters({ ...filters, projectId: e.target.value })
                }
              >
                <option value="All">All</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="two">
            <div className="field">
              <label>From</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) =>
                  setFilters({ ...filters, from: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label>To</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              />
            </div>
          </div>
          <button
            className="link-btn"
            onClick={() =>
              setFilters({
                type: "All",
                category: "All",
                projectId: "All",
                from: "",
                to: "",
              })
            }
          >
            Clear filters
          </button>
        </div>
      )}
      {error && <div className="error-box">{error}</div>}
      <div className="section-head">
        <h2>Transactions</h2>
        <span className="subtle">{visible.length} records</span>
      </div>
      {loading ? (
        <div className="list-card empty">Loading transactions…</div>
      ) : (
        visible.map((x) => (
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
            <div style={{ textAlign: "right" }}>
              <div className={`tx-amount ${x.type}`}>
                {x.type === "income" ? "+" : "-"} {money(x.amount)}
              </div>
              <button onClick={() => edit(x)} className="plain-icon">
                <FiEdit2 />
              </button>
              <button
                onClick={async () => {
                  if (window.confirm("Delete this transaction?")) {
                    await deleteTransaction(x._id);
                    load();
                  }
                }}
                className="danger-icon"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))
      )}
      {!loading && !visible.length && (
        <div className="list-card empty">
          No transactions match these filters.
        </div>
      )}
      {open && (
        <Modal
          title={editing ? "Edit Transaction" : "Add Transaction"}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={submit}>
            <div className="action-row">
              <button
                type="button"
                className="income-btn"
                onClick={() =>
                  setForm({
                    ...form,
                    type: "income",
                    category: cats.find((c) => c.type === "income")?.name || "",
                  })
                }
              >
                ↓ Income
              </button>
              <button
                type="button"
                className="expense-btn"
                onClick={() =>
                  setForm({
                    ...form,
                    type: "expense",
                    category:
                      cats.find((c) => c.type === "expense")?.name || "",
                  })
                }
              >
                ↑ Expense
              </button>
            </div>
            <div className="field">
              <label>Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Amount *</label>
              <input
                required
                min="0"
                step="0.01"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Category</label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {cats
                  .filter((c) => c.type === form.type)
                  .map((c) => (
                    <option key={c._id}>{c.name}</option>
                  ))}
              </select>
            </div>
            <div className="field">
              <label>Related Project</label>
              <select
                value={form.projectId}
                onChange={(e) =>
                  setForm({ ...form, projectId: e.target.value })
                }
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Date</label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <button className="primary-btn">
              {editing ? "Update Transaction" : "Save Transaction"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
