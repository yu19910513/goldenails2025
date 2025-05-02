import React, { useState } from 'react';
import './TabbedView.css'; // Make sure styling works for dynamic tabs

/**
 * A reusable tabbed view component that dynamically renders tabs and their
 * associated content based on the `tabs` prop.
 *
 * @component
 * @example
 * const tabs = [
 *   { key: 'menu', label: 'OUR SERVICES', Component: NailSalonMenu },
 *   { key: 'technicians', label: 'MEET OUR TECHNICIAN', Component: Team },
 * ];
 * return <TabbedView tabs={tabs} />;
 *
 * @param {Object} props - Component props
 * @param {Array<Object>} props.tabs - Array of tab configuration objects
 * @param {string} props.tabs[].key - Unique identifier for the tab
 * @param {string} props.tabs[].label - Label to display on the tab button
 * @param {React.ComponentType} props.tabs[].Component - React component to render when the tab is active
 *
 * @returns {JSX.Element} A tabbed interface with dynamic tab content
 */
const TabbedView = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key || '');

  return (
    <div className="tabbed-view-container">
      <div className="tabbed-view-tabs">
        {tabs.map(({ key, label }) => (
          <div
            key={key}
            className={`tabbed-view-tab ${activeTab === key ? 'tabbed-view-active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="tabbed-view-content" id="tabs">
        {tabs.map(({ key, Component }) =>
          activeTab === key ? <Component key={key} /> : null
        )}
      </div>
    </div>
  );
};

export default TabbedView;
