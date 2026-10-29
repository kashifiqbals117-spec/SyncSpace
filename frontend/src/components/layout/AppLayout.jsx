import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';

export const AppLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100 flex flex-col">
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <main className="flex-1 flex flex-col min-w-0">
          <Outlet context={{ onOpenMobile: () => setIsMobileOpen(true) }} />
        </main>
      </div>
    </div>
  );
};
