import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiFolder, FiCreditCard, FiCalendar, FiPlus } from "react-icons/fi";

export default function BottomNav() {
  const nav = useNavigate();
  const items = [
    ["/", "Home", FiHome],
    ["/projects", "Projects", FiFolder],
    ["/money", "Money", FiCreditCard],
    ["/schedule", "Schedule", FiCalendar],
  ];
  return (
    <div className="bottom-nav">
      {items.slice(0, 2).map(([to, label, I]) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <I />
          <span>{label}</span>
        </NavLink>
      ))}
      <button className="nav-add" onClick={() => nav("/money?add=1")} aria-label="Add transaction">
        <FiPlus />
      </button>
      {items.slice(2).map(([to, label, I]) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <I />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  );
}
