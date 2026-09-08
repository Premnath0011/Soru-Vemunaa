import React, { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import Header from "../../components/Header";
import Modal from "../../components/Modal";
import {
  getIdeas,
  createIdea,
  updateIdea,
  deleteIdea,
} from "../../services/ideaService";
const blank = {
  title: "",
  description: "",
  category: "Content",
  status: "Idea",
};
export default function Ideas() {
  const [data, setData] = useState([]),
    [open, setOpen] = useState(false),
    [form, setForm] = useState(blank),
    [edit, setEdit] = useState(null),
    [tab, setTab] = useState("All"),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); return getIdeas().then((x) => setData(Array.isArray(x) ? x : [])).catch((e) => setError(e.response?.data?.message || "Could not load ideas.")).finally(() => setLoading(false)); };
  useEffect(() => {
    load();
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    try {
      edit ? await updateIdea(edit, form) : await createIdea(form);
      setOpen(false);
      setEdit(null);
      setForm(blank);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not save idea.");
    }
  };
  return (
    <>
      <Header
        title="Ideas"
        subtitle="Capture your creative ideas"
        add
        onAdd={() => {
          setEdit(null);
          setForm(blank);
          setOpen(true);
        }}
      />
      <div className="tabs">
        {["All", "Content", "Collab", "Personal"].map((x) => (
          <button
            className={`tab ${tab === x ? "active" : ""}`}
            onClick={() => setTab(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      {error && <div className="error-box">{error}</div>}
      {loading ? <div className="list-card empty">Loading ideas…</div> : data
        .filter((x) => tab === "All" || x.category === tab)
        .map((x) => (
          <div className="idea-card" key={x._id}>
            <div style={{ display: "flex", gap: 12 }}>
              <div className="avatar-icon">
                <FiEdit2 />
              </div>
              <div style={{ flex: 1 }}>
                <div className="tx-title">{x.title}</div>
                <div className="tx-sub">
                  {x.description || "No description"}
                </div>
                <span className="badge-soft completed" style={{ marginTop: 7 }}>
                  {x.category} • {x.status}
                </span>
              </div>
              <div>
                <button
                  onClick={() => {
                    setEdit(x._id);
                    setForm(x);
                    setOpen(true);
                  }}
                  style={{
                    border: 0,
                    background: "transparent",
                    color: "#5d73dc",
                  }}
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm("Delete this idea?")) {
                      await deleteIdea(x._id);
                      load();
                    }
                  }}
                  style={{
                    border: 0,
                    background: "transparent",
                    color: "#e84b4b",
                  }}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      {!loading && !data.length && (
        <div className="list-card empty">No ideas yet. Add one!</div>
      )}
      {open && (
        <Modal
          title={edit ? "Edit Idea" : "New Idea"}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={submit}>
            <div className="field">
              <label>Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Best biryani in town"
              />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="two">
              <div className="field">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option>Content</option>
                  <option>Collab</option>
                  <option>Personal</option>
                </select>
              </div>
              <div className="field">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Idea</option>
                  <option>Planned</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
            <button className="primary-btn">
              <FiPlus /> Save Idea
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
