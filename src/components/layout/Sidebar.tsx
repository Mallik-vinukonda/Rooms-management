'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BedDouble,
  FileText,
  CalendarClock,
  Users,
  Wrench,
  Sparkles,
  ClipboardList,
  Settings,
  UserCog,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Operations',
    items: [
      { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={18} /> },
      { label: 'Rooms', href: '/rooms', icon: <BedDouble size={18} /> },
      { label: 'Requests', href: '/requests', icon: <FileText size={18} /> },
      { label: 'Reservations', href: '/reservations', icon: <CalendarClock size={18} /> },
      { label: 'Guests', href: '/guests', icon: <Users size={18} /> },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Maintenance', href: '/maintenance', icon: <Wrench size={18} /> },
      { label: 'Housekeeping', href: '/housekeeping', icon: <Sparkles size={18} /> },
      { label: 'Activity Log', href: '/activity', icon: <ClipboardList size={18} /> },
      { label: 'Reports', href: '/reports', icon: <BarChart3 size={18} /> },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Users', href: '/users', icon: <UserCog size={18} /> },
      { label: 'Settings', href: '/settings', icon: <Settings size={18} /> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo & Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700/50">
        <Image
          src="/devipuram-logo.png"
          alt="Devipuram"
          width={36}
          height={36}
          className="rounded-md bg-white p-0.5 flex-shrink-0"
        />
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-white truncate">Sri Villa</h1>
            <p className="text-[11px] text-gray-400 truncate">Guest House</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden md:block border-t border-gray-700/50 p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="nav-item w-full justify-center"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-gray-900 text-white shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-gray-900 flex flex-col z-40
          transition-all duration-200 ease-in-out
          ${collapsed ? 'w-[60px]' : 'w-[240px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Spacer */}
      <div
        className={`hidden md:block flex-shrink-0 transition-all duration-200 ${
          collapsed ? 'w-[60px]' : 'w-[240px]'
        }`}
      />
    </>
  );
}
