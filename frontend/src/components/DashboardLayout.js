import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
const DashboardLayout = () => {
    return (_jsxs("div", { className: "min-h-screen bg-slate-50", children: [_jsx(Navbar, {}), _jsxs("div", { className: "mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8", children: [_jsx("aside", { className: "hidden w-64 shrink-0 lg:block", children: _jsx(Sidebar, {}) }), _jsx("main", { className: "flex-1", children: _jsx(Outlet, {}) })] })] }));
};
export default DashboardLayout;
