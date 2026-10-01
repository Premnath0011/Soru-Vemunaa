import React from 'react';
import Logo from './Logo';

export default function LoadingScreen({label='Loading Soru_Venumaa'}) {
  return (
    <div className="loading-screen">
      <div className="loading-brand">
        <div className="loading-logo-wrap"><Logo size={92} ring={false} /></div>
        <div className="loading-pulse"><span/><span/><span/></div>
        <strong>{label}</strong>
        <small>Your creator workspace</small>
      </div>
    </div>
  );
}
