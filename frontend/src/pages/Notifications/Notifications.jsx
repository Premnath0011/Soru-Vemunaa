import React, { useEffect, useMemo, useState } from "react";
import { FiBell, FiCalendar, FiClock, FiCheck } from "react-icons/fi";
import Header from "../../components/Header";
import { getSchedules } from "../../services/scheduleService";
import { getProjects } from "../../services/projectService";
export default function Notifications() {
  const [items, setItems] = useState([]),
    [projects, setProjects] = useState([]),
    [read, setRead] = useState(() =>
      JSON.parse(localStorage.getItem("soru_read_notifications") || "[]"),
    );
  useEffect(() => {
    Promise.all([getSchedules(), getProjects()]).then(([s, p]) => {
      setItems(s);
      setProjects(p);
    });
  }, []);
  const notes = useMemo(() => {
    const now = new Date();
    const out = items
      .filter((x) => x.status === "Planned")
      .map((x) => ({
        id: `s-${x._id}`,
        title: x.title,
        text: `${x.type} • ${new Date(x.date).toLocaleDateString("en-IN")}${x.time ? ` at ${x.time}` : ""}`,
        icon: FiCalendar,
      }));
    projects
      .filter((p) => p.endDate && p.status === "Ongoing")
      .forEach((p) => {
        const d = new Date(p.endDate),
          diff = Math.ceil((d - now) / 86400000);
        if (diff >= 0 && diff <= 7)
          out.push({
            id: `p-${p._id}`,
            title: `Deadline: ${p.title}`,
            text:
              diff === 0
                ? "Due today"
                : `Due in ${diff} day${diff > 1 ? "s" : ""}`,
            icon: FiClock,
          });
      });
    return out.sort((a, b) => a.title.localeCompare(b.title));
  }, [items, projects]);
  const markAll = () => {
    const ids = notes.map((x) => x.id);
    setRead(ids);
    localStorage.setItem("soru_read_notifications", JSON.stringify(ids));
  };
  return (
    <>
      <Header title="Notifications" subtitle="Important creator updates" />
      <div className="section-head">
        <h2>{notes.filter((x) => !read.includes(x.id)).length} unread</h2>
        <button className="link-btn" onClick={markAll}>
          <FiCheck /> Mark all read
        </button>
      </div>
      {notes.length ? (
        notes.map((n) => {
          const I = n.icon,
            done = read.includes(n.id);
          return (
            <div
              className={`list-card transaction notification ${done ? "read" : ""}`}
              key={n.id}
            >
              <div className="avatar-icon">
                <I />
              </div>
              <div className="tx-main">
                <div className="tx-title">{n.title}</div>
                <div className="tx-sub">{n.text}</div>
              </div>
              {!done && <span className="dot" />}
            </div>
          );
        })
      ) : (
        <div className="list-card empty">
          <FiBell /> No notifications right now.
        </div>
      )}
    </>
  );
}
