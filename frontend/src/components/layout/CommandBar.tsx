import React, { useState } from 'react';
import { Command, Sparkles, Calendar, Search } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const CommandBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 command-bar z-50
        bg-graphite-400/80 border-t border-graphite-300/30
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'h-16' : 'h-12'}`}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button 
            onClick={toggleExpand}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-graphite-300/40"
          >
            <Command size={18} className="text-text-secondary" />
          </button>
          
          <div className="ml-3 hidden md:flex items-center">
            <span className="text-xs text-text-tertiary tracking-wider font-medium">SFSanity</span>
          </div>
        </div>

        <nav className="flex items-center justify-center space-x-3 md:space-x-6">
          <NavLink to="/" className={({isActive}) => 
            `cmd-btn ${isActive ? 'text-text-primary bg-graphite-300/40' : ''}`
          }>
            <Sparkles size={18} />
            <span className="hidden md:inline text-sm">Home</span>
          </NavLink>
          
          <NavLink to="/events" className={({isActive}) => 
            `cmd-btn ${isActive ? 'text-text-primary bg-graphite-300/40' : ''}`
          }>
            <Calendar size={18} />
            <span className="hidden md:inline text-sm">Events</span>
          </NavLink>
        </nav>

        <div className="flex items-center">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-graphite-300/40">
            <Search size={18} className="text-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
};