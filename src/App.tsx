import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb, X } from 'lucide-react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { useSearch } from './hooks/useSearch';
import { useEvents } from './hooks/useEvents';
import { APP_CONFIG } from './config/app';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { Notes } from './pages/Notes';
import { Signals } from './pages/Signals';
import { Events } from './pages/Events';

/**
 * Context for sharing state between App and pages
 */
export const AppContext = React.createContext<{
  viewMode: 'tiles' | 'list';
  setViewMode: (mode: 'tiles' | 'list') => void;
  jumpToEventsBottom: () => void;
  openInsightsModal: () => void;
  searchQuery: string;
  searchResults: any[];
  isSearching: boolean;
  hasQuery: boolean;
  search: (query: string) => void;
  clearSearch: () => void;
  getHighlightedText: (query: string, text: string) => string;
}>({
  viewMode: 'tiles',
  setViewMode: () => {},
  jumpToEventsBottom: () => {},
  openInsightsModal: () => {},
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  hasQuery: false,
  search: () => {},
  clearSearch: () => {},
  getHighlightedText: () => '',
});

/**
 * Page wrapper component with consistent animations
 * Uses centralized animation configuration from APP_CONFIG
 */
const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const variants = {
    initial: {
      opacity: 0,
      filter: 'blur(12px)',
    },
    animate: {
      opacity: 1,
      filter: 'blur(0px)',
    },
    exit: {
      opacity: 0.25,
      filter: 'blur(12px)',
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: APP_CONFIG.PAGE_TRANSITION_DURATION,
        ease: APP_CONFIG.PAGE_TRANSITION_EASING
      }}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  const location = useLocation();
  const [viewMode, setViewMode] = React.useState<'tiles' | 'list'>(APP_CONFIG.DEFAULT_EVENTS_VIEW_MODE);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  
  // Get events data for search
  const { events } = useEvents();
  
  // Search functionality
  const {
    searchQuery,
    searchResults,
    isSearching,
    hasQuery,
    search,
    clearSearch,
    getHighlightedText,
  } = useSearch({ data: events });
  
  /**
   * Toggles between tiles and list view modes
   */
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'tiles' ? 'list' : 'tiles');
  };
  
  /**
   * Scrolls to the bottom of the events section
   */
  const jumpToEventsBottom = () => {
    const eventsSection = document.getElementById('recent-events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };
  
  /**
   * Opens the insights modal
   */
  const openInsightsModal = () => {
    setIsInsightsModalOpen(true);
  };
  
  /**
   * Toggles search visibility
   */
  const toggleSearch = () => {
    setShowSearch(prev => {
      if (prev) {
        clearSearch(); // Clear search when closing
      }
      return !prev;
    });
  };
  
  // Determine if we should show events controls based on current route
  const showEventsControls = location.pathname === '/';
  const showInsightsButton = location.pathname === '/';
  
  const topNavProps = {
    viewMode,
    onToggleViewMode: setViewMode,
    onJumpToBottom: jumpToEventsBottom,
    showEventsControls,
    showInsightsButton,
    onOpenInsights: openInsightsModal,
    searchQuery,
    onSearchChange: search,
    isSearching,
    showSearch,
    onToggleSearch: toggleSearch,
  };

  return (
    <ErrorBoundary>
      <AppContext.Provider value={{ 
        viewMode, 
        setViewMode, 
        jumpToEventsBottom, 
        openInsightsModal,
        searchQuery,
        searchResults,
        isSearching,
        hasQuery,
        search,
        clearSearch,
        getHighlightedText,
      }}>
        <Layout topNavProps={topNavProps}>
          {/* Insights Modal */}
          {isInsightsModalOpen && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsInsightsModalOpen(false);
                }
              }}
            >
              <div className="bg-background-secondary rounded-xl border border-graphite-300/30 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
                <div className="p-6 border-b border-graphite-300/30 flex items-center justify-between">
                  <h2 className="text-xl font-medium tracking-tight flex items-center">
                    <Lightbulb size={20} className="mr-3 text-accent" />
                    Insights
                  </h2>
                  <button
                    onClick={() => setIsInsightsModalOpen(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-graphite-300/40 text-text-secondary hover:text-text-primary transition-all duration-200"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="p-6 text-text-secondary space-y-6">
                  <p className="leading-relaxed">
                    This webpage dynamically loads events from a database aggregating events in SF.
                  </p>
                  
                  <div className="leading-relaxed">
                    <p className="text-text-primary font-medium mb-3">TODOs</p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start">
                        <span className="text-text-tertiary mr-2">-</span>
                        <span>Events can be filtered using various criteria (e.g., date, type, status)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-text-tertiary mr-2">-</span>
                        <span>Scan events history for evolving patterns, like buzzwords and contents</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><Home isInsightsModalOpen={isInsightsModalOpen} setIsInsightsModalOpen={setIsInsightsModalOpen} /></PageWrapper>} />
              <Route path="/projects" element={<PageWrapper><Projects /></PageWrapper>} />
              <Route path="/notes" element={<PageWrapper><Notes /></PageWrapper>} />
              <Route path="/signals" element={<PageWrapper><Signals /></PageWrapper>} />
              <Route path="/events" element={<PageWrapper><Events /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </Layout>
      </AppContext.Provider>
    </ErrorBoundary>
  );
}

export default App;