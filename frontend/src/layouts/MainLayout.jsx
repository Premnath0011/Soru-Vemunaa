import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Decor from '../components/Decor';

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Decor />
      <main className="phone-shell">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
