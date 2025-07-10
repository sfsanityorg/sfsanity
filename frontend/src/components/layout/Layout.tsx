import React from 'react';
import { useLocation } from 'react-router-dom';
import TopNav from './TopNav';

type LayoutProps = {
  children: React.ReactNode;
  /** Props to pass to TopNav component */
  topNavProps?: {
    viewMode?: 'tiles' | 'list';
    onToggleViewMode?: () => void;
    onJumpToBottom?: () => void;
    showEventsControls?: boolean;
    onOpenInsights?: () => void;
  };
};

/**
 * Main layout component that wraps all pages
 * Provides consistent navigation and structure
 */
export const Layout: React.FC<LayoutProps> = ({ children, topNavProps }) => {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <TopNav {...topNavProps} />

      {/* Main content */}
      <main className="flex-1 inertia-scroll">
        {children}
      </main>
    </div>
  );
};