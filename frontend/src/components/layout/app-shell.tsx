import React from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export const AppShell: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">{children}</main>
      </div>
    </div>
  );
};
