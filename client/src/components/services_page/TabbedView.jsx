import React, { useState } from 'react';
import NailSalonMenu from './NailSalonMenu';
import Team from './Team';
import './TabbedView.css'; // Updated stylesheet for browser-style tabs

const TabbedView = () => {
  const [activeTab, setActiveTab] = useState('menu'); // Tracks the active tab

  return (
    <div className="tabbed-view-container">
      <div className="tabs">
        <div
          className={`tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          OUR SERVICES
        </div>
        <div
          className={`tab ${activeTab === 'technicians' ? 'active' : ''}`}
          onClick={() => setActiveTab('technicians')}
        >
          MEET OUR TECHNICIAN
        </div>
      </div>
      <div className="tab-content" id='tabs'>
        {activeTab === 'menu' && <NailSalonMenu />}
        {activeTab === 'technicians' && <Team />}
      </div>
    </div>
  );
};

export default TabbedView;
