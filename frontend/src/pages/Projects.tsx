import React, { useState } from 'react';
import { PlusCircle, Filter, Calendar as CalendarIcon, LayoutGrid, ArrowUpRight, Target, Clock, Users, Sparkles } from 'lucide-react';

type ProjectStatus = 'planning' | 'active' | 'review' | 'complete';

interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: number;
  dueDate: Date;
  progress: number;
  team: string[];
  impact: string;
}

export const Projects: React.FC = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'timeline'>('kanban');
  
  // Sample projects data
  const projects: Project[] = [
    {
      id: '1',
      title: 'Product Roadmap',
      description: 'Define the next 6 months of product development with clear milestones and OKRs',
      status: 'active',
      priority: 1,
      dueDate: new Date('2025-05-15'),
      progress: 35,
      team: ['Sarah K.', 'Michael R.', 'David L.'],
      impact: 'High impact on product direction and team alignment',
    },
    {
      id: '2',
      title: 'Investor Relations',
      description: 'Prepare documentation and presentations for Series A funding round',
      status: 'planning',
      priority: 2,
      dueDate: new Date('2025-06-01'),
      progress: 15,
      team: ['Alex M.', 'Jessica P.'],
      impact: 'Critical for company growth and scaling',
    },
    {
      id: '3',
      title: 'Team Expansion',
      description: 'Recruitment plan for engineering and design roles to support growth',
      status: 'planning',
      priority: 2,
      dueDate: new Date('2025-06-10'),
      progress: 10,
      team: ['Rachel S.', 'Tom B.'],
      impact: 'Essential for maintaining product quality and velocity',
    },
    {
      id: '4',
      title: 'User Research',
      description: 'Qualitative interviews with power users to identify pain points and opportunities',
      status: 'active',
      priority: 1,
      dueDate: new Date('2025-05-20'),
      progress: 65,
      team: ['Chris L.', 'Emma W.'],
      impact: 'Direct impact on user satisfaction and retention',
    },
    {
      id: '5',
      title: 'Brand Refinement',
      description: 'Update visual language and messaging to align with new positioning',
      status: 'review',
      priority: 3,
      dueDate: new Date('2025-05-12'),
      progress: 85,
      team: ['Nina P.', 'James R.'],
      impact: 'Strengthens market position and user trust',
    },
  ];

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: ProjectStatus): string => {
    switch(status) {
      case 'planning': return 'border-graphite-100';
      case 'active': return 'border-accent';
      case 'review': return 'border-accent-muted';
      case 'complete': return 'border-text-subtle';
      default: return 'border-graphite-100';
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 pt-20 sm:pt-32 pb-12">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 sm:gap-8 mb-12 sm:mb-16">
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-title mb-3 tracking-tight">Projects</h1>
          <p className="text-text-secondary text-base sm:text-subtitle max-w-lg">
            Track and manage your strategic initiatives
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 lg:gap-6 text-text-tertiary text-xs sm:text-sm mt-4 sm:mt-6">
            <div className="flex items-center bg-graphite-400/30 px-3 py-1.5 rounded-lg">
              <Target size={16} className="mr-2" />
              <span>12 Active Projects</span>
            </div>
            <div className="flex items-center bg-graphite-400/30 px-3 py-1.5 rounded-lg">
              <Clock size={16} className="mr-2" />
              <span>85% On Schedule</span>
            </div>
            <div className="flex items-center bg-graphite-400/30 px-3 py-1.5 rounded-lg">
              <Users size={16} className="mr-2" />
              <span>18 Team Members</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button className="cmd-btn">
            <Filter size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="ml-1 text-sm">Filter</span>
          </button>
          
          <div className="flex bg-graphite-400/30 rounded-lg p-1 order-last sm:order-none">
            <button 
              className={`px-2 sm:px-3 py-1 rounded text-sm ${viewMode === 'kanban' ? 'bg-graphite-300 text-white' : 'text-text-secondary'}`}
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button 
              className={`px-2 sm:px-3 py-1 rounded text-sm ${viewMode === 'timeline' ? 'bg-graphite-300 text-white' : 'text-text-secondary'}`}
              onClick={() => setViewMode('timeline')}
            >
              <CalendarIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
          
          <button className="flex-none flex items-center px-3 sm:px-4 py-2 bg-accent hover:bg-accent-muted text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/20 group sm:ml-auto">
            <PlusCircle size={16} className="sm:w-[18px] sm:h-[18px] mr-2 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative top-px">New Project</span>
          </button>
        </div>
      </div>
      
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map(project => (
            <div
              key={project.id} 
              className={`card hover:translate-y-[-2px] sm:hover:translate-y-[-4px] group transition-all duration-300 ease-out cursor-pointer border-l-2 ${getStatusColor(project.status)} p-4 sm:p-6`}
            >
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active' ? 'bg-accent/10 text-accent' :
                    project.status === 'planning' ? 'bg-graphite-300/20 text-text-secondary' :
                    project.status === 'review' ? 'bg-accent-muted/10 text-accent-muted' :
                    'bg-text-subtle/10 text-text-subtle'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <span className="text-xs text-text-tertiary">
                  {formatDate(project.dueDate)}
                </span>
              </div>
              
              <h3 className="text-lg sm:text-xl font-medium mb-2 group-hover:text-accent transition-colors">{project.title}</h3>
              <p className="text-text-secondary text-xs sm:text-sm mb-4 sm:mb-6">{project.description}</p>
              
              <div className="flex items-center mb-4 sm:mb-6 space-x-2">
                <div className="flex -space-x-2">
                  {project.team.map((member, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-full bg-graphite-300 border-2 border-background flex items-center justify-center text-xs text-white"
                      title={member}
                    >
                      {member.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-text-tertiary ml-2">{project.team.length} members</span>
              </div>
              
              <div className="flex items-start space-x-2 mb-6">
                <Sparkles size={14} className="text-accent mt-1" />
                <p className="text-xs sm:text-sm text-text-secondary">{project.impact}</p>
              </div>
              
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-text-tertiary">Progress</span>
                  <span className="text-xs sm:text-sm font-medium">{project.progress}%</span>
                </div>
                <div className="w-full h-1 bg-graphite-300 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${
                      project.status === 'active' ? 'bg-accent' :
                      project.status === 'review' ? 'bg-accent-muted' :
                      'bg-graphite-100'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="card flex items-center justify-center border border-dashed border-graphite-200 bg-transparent hover:bg-graphite-400/10 transition-all duration-200 cursor-pointer group">
            <div className="text-center text-text-tertiary group-hover:text-text-secondary">
              <PlusCircle size={20} className="sm:w-6 sm:h-6 mx-auto mb-3 opacity-50 group-hover:opacity-100" />
              <p className="text-xs sm:text-sm">Add new project</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-background-secondary p-0 overflow-hidden">
          <div className="p-6 border-b border-graphite-300/30">
            <h3 className="text-base sm:text-lg font-medium">Timeline View</h3>
          </div>
          
          <div className="p-4 sm:p-6">
            {projects.map(project => (
              <div key={project.id} className="mb-4 sm:mb-6 last:mb-0">
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full ${project.status === 'active' ? 'bg-accent' : 'bg-graphite-200'} mr-3`}></div>
                  <h4 className="text-base sm:text-lg flex-1">{project.title}</h4>
                  <div className="ml-auto text-xs sm:text-sm text-text-tertiary">{formatDate(project.dueDate)}</div>
                </div>
                
                <div className="ml-4 sm:ml-6 pl-3 sm:pl-4 border-l border-graphite-300/30">
                  <p className="text-text-secondary text-xs sm:text-sm mb-3">{project.description}</p>
                  
                  <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-3">
                    <div className="w-24 sm:w-32">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-text-tertiary">Progress</span>
                        <span className="text-xs">{project.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-graphite-300 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <button className="sm:ml-6 text-xs sm:text-sm text-text-tertiary hover:text-text-primary flex items-center group">
                      Details
                      <ArrowUpRight size={12} className="sm:w-[14px] sm:h-[14px] ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};