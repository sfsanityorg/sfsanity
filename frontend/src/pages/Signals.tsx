import React, { useState } from 'react';
import { Bell, AlertTriangle, AlertCircle, CheckCircle2, Clock, Filter, ArrowUpRight } from 'lucide-react';

type SignalType = 'alert' | 'notification' | 'insight';
type SignalPriority = 'high' | 'medium' | 'low';

interface Signal {
  id: string;
  type: SignalType;
  title: string;
  description: string;
  timestamp: Date;
  priority: SignalPriority;
  read: boolean;
  actionable: boolean;
}

export const Signals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SignalType | 'all'>('all');
  
  // Sample signals data
  const signals: Signal[] = [
    {
      id: '1',
      type: 'alert',
      title: 'Unusual activity detected',
      description: 'Multiple failed login attempts from unrecognized IP address 192.168.1.23',
      timestamp: new Date('2025-05-10T09:32:00'),
      priority: 'high',
      read: false,
      actionable: true,
    },
    {
      id: '2',
      type: 'notification',
      title: 'Project milestone reached',
      description: 'The Product Vision project has reached 50% completion ahead of schedule',
      timestamp: new Date('2025-05-10T08:15:00'),
      priority: 'medium',
      read: true,
      actionable: false,
    },
    {
      id: '3',
      type: 'insight',
      title: 'Productivity pattern detected',
      description: 'Your focus score increases by 32% when you have no meetings before noon',
      timestamp: new Date('2025-05-09T23:45:00'),
      priority: 'low',
      read: false,
      actionable: true,
    },
    {
      id: '4',
      type: 'alert',
      title: 'Calendar conflict',
      description: 'You have two overlapping meetings scheduled for tomorrow at 3:00 PM',
      timestamp: new Date('2025-05-09T17:20:00'),
      priority: 'medium',
      read: true,
      actionable: true,
    },
    {
      id: '5',
      type: 'insight',
      title: 'Knowledge gap identified',
      description: 'Based on your recent notes, you might benefit from exploring "network effects" in more depth',
      timestamp: new Date('2025-05-09T14:10:00'),
      priority: 'low',
      read: false,
      actionable: false,
    },
  ];

  const filteredSignals = activeTab === 'all' 
    ? signals 
    : signals.filter(signal => signal.type === activeTab);
  
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  const getSignalIcon = (type: SignalType, priority: SignalPriority): JSX.Element => {
    switch(type) {
      case 'alert':
        return <AlertTriangle size={18} className={`${priority === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />;
      case 'notification':
        return <Bell size={18} className="text-accent" />;
      case 'insight':
        return <AlertCircle size={18} className="text-green-500" />;
      default:
        return <Bell size={18} className="text-text-tertiary" />;
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 pt-20 sm:pt-32 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 sm:mb-12">
        <div>
          <h1 className="text-2xl sm:text-title mb-3 tracking-tight">Signals</h1>
          <p className="text-text-secondary text-base sm:text-subtitle max-w-lg">
            System messages and intelligent alerts
          </p>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button className="cmd-btn">
            <Filter size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="ml-1 text-sm">Filter</span>
          </button>
          
          <button className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-text-secondary hover:text-text-primary bg-graphite-400/30 hover:bg-graphite-300/40 rounded-lg transition-all duration-200">
            <CheckCircle2 size={14} className="sm:w-4 sm:h-4 mr-2" />
            Mark all as read
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-graphite-300/30 mb-6 sm:mb-8">
        <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
          <button 
            className={`pb-3 sm:pb-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'all' ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`pb-3 sm:pb-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'alert' ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'}`}
            onClick={() => setActiveTab('alert')}
          >
            Alerts
          </button>
          <button 
            className={`pb-3 sm:pb-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'notification' ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'}`}
            onClick={() => setActiveTab('notification')}
          >
            Notifications
          </button>
          <button 
            className={`pb-3 sm:pb-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'insight' ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'}`}
            onClick={() => setActiveTab('insight')}
          >
            Insights
          </button>
        </div>
      </div>
      
      {/* Signals List */}
      <div className="space-y-4">
        {filteredSignals.map(signal => (
          <div 
            key={signal.id}
            className={`card group hover:translate-x-1 transition-all duration-200 p-4 sm:p-6 ${!signal.read ? 'bg-background-secondary' : 'bg-background-tertiary/50'}`}
          >
            <div className="flex items-start">
              <div className="mr-3 sm:mr-4 mt-1">
                {React.cloneElement(getSignalIcon(signal.type, signal.priority), {
                  size: 16,
                  className: `${getSignalIcon(signal.type, signal.priority).props.className} sm:w-[18px] sm:h-[18px]`
                })}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-1 gap-2">
                  <h3 className={`text-lg font-medium ${!signal.read ? '' : 'text-text-secondary'}`}>
                    {signal.title}
                  </h3>
                  <div className="flex items-center text-text-tertiary text-xs sm:text-sm self-start sm:self-center">
                    <Clock size={12} className="sm:w-[14px] sm:h-[14px] mr-1" />
                    {formatTime(signal.timestamp)}
                  </div>
                </div>
                
                <p className="text-text-secondary text-xs sm:text-sm mb-3">{signal.description}</p>
                
                {signal.actionable && (
                  <button className="text-accent text-xs sm:text-sm flex items-center group-hover:underline">
                    Take action
                    <ArrowUpRight size={12} className="sm:w-[14px] sm:h-[14px] ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                )}
              </div>
              
              <div className="ml-3 sm:ml-4">
                {!signal.read ? (
                  <div className="h-2 w-2 rounded-full bg-accent"></div>
                ) : (
                  <CheckCircle2 size={14} className="sm:w-4 sm:h-4 text-text-subtle" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};