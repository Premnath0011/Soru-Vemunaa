import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBell, FiPlus, FiMenu } from 'react-icons/fi';
import Logo from './Logo';

export default function Header({ title, subtitle, back = false, add = false, menu = false, brand = false, onAdd }) {
  const nav = useNavigate();
  return (
    <div className="topbar">
      <div className="topbar-side topbar-side--left">
        {back ? (
          <button className="icon-btn" onClick={() => nav(-1)} aria-label="Go back">
            <FiArrowLeft />
          </button>
        ) : menu ? (
          <button className="icon-btn" onClick={() => nav('/more')} aria-label="Open menu">
            <FiMenu />
          </button>
        ) : (
          <span className="icon-btn-spacer" />
        )}
      </div>
      <div className="top-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-side topbar-side--right">
        {brand && <Logo size={34} />}
        <button
          className="icon-btn"
          onClick={add ? (onAdd || (() => {})) : () => nav('/notifications')}
          aria-label={add ? 'Add' : 'Notifications'}
        >
          {add ? <FiPlus /> : <FiBell />}
        </button>
      </div>
    </div>
  );
}
