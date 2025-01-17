import React, { useState } from 'react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button 
        id="toggle-sidebar"
        className={`toggle-button ${isOpen ? 'active' : ''}`}
        aria-label={isOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        aria-expanded={isOpen}
        onClick={toggleSidebar}
      >
        <span className="toggle-icon"></span>
      </button>
      <div id="app" className={`app ${!isOpen ? 'hidden' : ''}`}>
        <div id="sidebar">
          <div id="entry-details">
            <h2>Knowledge Base</h2>
          </div>
          <div id="editor">
            <textarea 
              id="content-editor" 
              placeholder="Write your entry here..."
              className="editor-input"
            ></textarea>
            <input 
              type="text" 
              id="tags-input" 
              placeholder="Tags (comma separated)"
              className="tags-input"
            />
            <div className="actions">
              <button id="new-entry" className="action-button">New Entry</button>
              <button id="save" className="action-button primary">Save</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
