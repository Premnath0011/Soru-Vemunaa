import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiFolder, FiCreditCard, FiCalendar, FiPlus, FiEdit3, FiDollarSign, FiClock, FiX } from 'react-icons/fi';
import Modal from './Modal';

export default function BottomNav() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const items = [
    ['/', 'Home', FiHome], ['/projects', 'Projects', FiFolder],
    ['/money', 'Money', FiCreditCard], ['/schedule', 'Schedule', FiCalendar]
  ];
  const go = path => { setOpen(false); nav(path); };
  return <>
    <div className="bottom-nav">
      {items.slice(0,2).map(([to,label,I]) => <NavLink key={to} to={to} end={to==='/'} className={({isActive})=>`nav-item ${isActive?'active':''}`}><I/><span>{label}</span></NavLink>)}
      <button className="nav-add" onClick={()=>setOpen(true)} aria-label="Quick add"><FiPlus/></button>
      {items.slice(2).map(([to,label,I]) => <NavLink key={to} to={to} className={({isActive})=>`nav-item ${isActive?'active':''}`}><I/><span>{label}</span></NavLink>)}
    </div>
    {open && <Modal title="Quick Add" onClose={()=>setOpen(false)}>
      <div className="quick-add-grid">
        <button onClick={()=>go('/projects?add=1')}><span><FiFolder/></span><strong>New Project</strong><small>Start a creator job</small></button>
        <button onClick={()=>go('/money?add=expense')}><span><FiDollarSign/></span><strong>Add Expense</strong><small>Record a business cost</small></button>
        <button onClick={()=>go('/ideas?add=1')}><span><FiEdit3/></span><strong>New Idea</strong><small>Save a content idea</small></button>
        <button onClick={()=>go('/schedule?add=1')}><span><FiClock/></span><strong>Add Task</strong><small>Schedule a creator task</small></button>
      </div>
      <button className="secondary-btn full" onClick={()=>setOpen(false)}><FiX/> Close</button>
    </Modal>}
  </>;
}
