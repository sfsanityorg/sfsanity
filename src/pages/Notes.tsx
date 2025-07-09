import React, { useState } from 'react';
import { File, Save, Plus, MoreHorizontal, Calendar, Tag, Search } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  preview: string;
  lastEdited: string;
  tags: string[];
}

export const Notes: React.FC = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Note');
  const [isSaved, setIsSaved] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const sampleNotes: Note[] = [
    {
      id: '1',
      title: 'Product Vision Framework',
      preview: 'A clear product vision serves as the north star for all development efforts and helps align the team...',
      lastEdited: '2 hours ago',
      tags: ['Strategy', 'Product']
    },
    {
      id: '2',
      title: 'Investor Meeting Notes - May 5',
      preview: 'Key talking points from meeting with Sequoia. They expressed interest in our AI capabilities...',
      lastEdited: 'Yesterday',
      tags: ['Meetings', 'Fundraising']
    },
    {
      id: '3',
      title: 'Team Structure Proposal',
      preview: 'As we scale from 15 to 30 people, we need to consider restructuring our teams to maintain agility...',
      lastEdited: '3 days ago',
      tags: ['Team', 'Operations']
    },
  ];

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsSaved(false);
  };
  
  const handleSave = () => {
    // Save logic would go here
    setIsSaved(true);
  };
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-12">
      <div className="flex gap-[30px]">
        {/* Notes Sidebar */}
        <div className={`w-80 shrink-0 bg-background-secondary rounded-2xl border border-graphite-300/30 backdrop-blur-md transition-all duration-300 ease-in-out ${showSidebar ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full w-0'}`}>
          <div className="h-full flex flex-col">
            <div className="p-7 border-b border-graphite-300/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Notes</h2>
                <button className="text-text-tertiary hover:text-text-primary">
                  <Plus size={18} />
                </button>
              </div>
              
              <div className="relative">
                <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
                <input 
                  type="text" 
                  placeholder="Search notes..."
                  className="w-full bg-graphite-400/40 border border-graphite-300/30 rounded-md py-2 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto inertia-scroll">
              {sampleNotes.map(note => (
                <div 
                  key={note.id} 
                  className="p-7 border-b border-graphite-300/20 cursor-pointer hover:bg-graphite-400/30 transition-colors last:border-b-0"
                >
                  <h3 className="text-base font-medium mb-1 truncate">{note.title}</h3>
                  <p className="text-text-tertiary text-sm mb-2 line-clamp-2">{note.preview}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-1">
                      {note.tags.map((tag, index) => (
                        <span key={index} className="text-xs px-2 py-0.5 rounded-full bg-graphite-300/40 text-text-tertiary">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-text-subtle">{note.lastEdited}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Editor Area */}
        <div className="flex-1">
          <div className="h-full flex flex-col rounded-2xl bg-gradient-to-b from-background-secondary to-background border border-graphite-300/30">
            <div className="flex items-center justify-between p-4 border-b border-graphite-300/30">
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-graphite-400/30"
              >
                <File size={18} />
              </button>
              
              <div className="flex-1 mx-4">
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full bg-transparent border-none text-xl font-medium focus:outline-none focus:ring-0 px-0"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="cmd-btn">
                  <Tag size={16} />
                </button>
                <button className="cmd-btn">
                  <Calendar size={16} />
                </button>
                <button 
                  onClick={handleSave}
                  className={`btn ${isSaved ? 'btn-secondary' : 'btn-primary'} flex items-center`}
                >
                  <Save size={16} className="mr-1" />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button className="cmd-btn">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-8 overflow-auto inertia-scroll">
              <textarea
                value={content}
                onChange={handleContentChange}
                placeholder="Start writing..."
                className="w-full h-full bg-transparent border-none text-lg leading-relaxed focus:outline-none focus:ring-0 resize-none"
                style={{ minHeight: 'calc(100vh - 180px)' }}
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};