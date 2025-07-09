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
    <div className="container mx-auto px-4 pt-32 pb-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-title mb-3 tracking-tight">Signals</h1>
          <p className="text-text-secondary text-subtitle max-w-lg">
            System messages and intelligent alerts
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="cmd-btn">
            <Filter size={18} />
            <span className="ml-1 text-sm">Filter</span>
          </button>
          
          <button className="flex items-center px-4 py-2 text-sm text-text-secondary hover:text-text-primary bg-graphite-400/30 hover:bg-graphite-300/40 rounded-lg transition-all duration-200">
            <CheckCircle2 size={16} className="mr-2" />
            Mark all as read
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-graphite-300/30 mb-8">
        <div className="flex space-x-8">
          <button 
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all' ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'alert' ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'}`}
            onClick={() => setActiveTab('alert')}
          >
            Alerts
          </button>
          <button 
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'notification' ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'}`}
            onClick={() => setActiveTab('notification')}
          >
            Notifications
          </button>
          <button 
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'insight' ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'}`}
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
            className={`card group hover:translate-x-1 transition-all duration-200 ${!signal.read ? 'bg-background-secondary' : 'bg-background-tertiary/50'}`}
          >
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                {getSignalIcon(signal.type, signal.priority)}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-lg font-medium ${!signal.read ? '' : 'text-text-secondary'}`}>
                    {signal.title}
                  </h3>
                  <div className="flex items-center text-text-tertiary text-sm">
                    <Clock size={14} className="mr-1" />
                    {formatTime(signal.timestamp)}
                  </div>
                </div>
                
                <p className="text-text-secondary text-sm mb-3">{signal.description}</p>
                
                {signal.actionable && (
                  <button className="text-accent text-sm flex items-center group-hover:underline">
                    Take action
                    <ArrowUpRight size={14} className="ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                )}
              </div>
              
              <div className="ml-4">
                {!signal.read ? (
                  <div className="h-2 w-2 rounded-full bg-accent"></div>
                ) : (
                  <CheckCircle2 size={16} className="text-text-subtle" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};