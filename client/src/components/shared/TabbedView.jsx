import React, { useState, useRef, useEffect } from 'react';
import './TabbedView.css'; // Make sure styling works for dynamic tabs

/**
 * A reusable, accessible, and state-preserving tabbed view component
 * that dynamically renders tabs and their associated content.
 *
 * Supports keyboard navigation (Left/Right arrow keys).
 *
 * @component
 * @example
 * const tabs = [
 * { key: 'menu', label: 'OUR SERVICES', Component: NailSalonMenu },
 * { key: 'technicians', label: 'MEET OUR TECHNICIAN', Component: Team },
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

  // --- Accessibility & Keyboard Nav ---
  const tabRefs = useRef([]);

  // Ensure refs array is in sync with the tabs prop
  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, tabs.length);
  }, [tabs]);

  // Handle keyboard navigation (Left/Right arrows)
  const handleKeyDown = (e, index) => {
    let newIndex = index;
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % tabs.length; // Wrap to start
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + tabs.length) % tabs.length; // Wrap to end
    }

    if (newIndex !== index) {
      const newActiveTabKey = tabs[newIndex].key;
      setActiveTab(newActiveTabKey);

      // Set focus to the new active tab button
      tabRefs.current[newIndex]?.focus();
    }
  };
  // --- End Accessibility ---

  return (
    <div className="tabbed-view-container">
      {/* 1. Added role="tablist" for accessibility */}
      <div className="tabbed-view-tabs" role="tablist">
        {tabs.map(({ key, label }, index) => (
          // 2. Changed <div> to <button> for semantics and a11y
          <button
            key={key}
            role="tab"
            id={`tab-${key}`}
            aria-controls={`panel-${key}`} // Links button to panel
            aria-selected={activeTab === key} // Tells screen readers which is active
            className={`tabbed-view-tab ${activeTab === key ? 'tabbed-view-active' : ''}`}
            onClick={() => setActiveTab(key)}

            // --- Accessibility & Keyboard Nav ---
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => (tabRefs.current[index] = el)} // Add ref to array
            tabIndex={activeTab === key ? 0 : -1} // Only active tab is in Tab-order
          // --- End Accessibility ---
          >
            {label}
          </button>
        ))}
      </div>
      <div className="tabbed-view-content" id="tabs">
        {/* 3. Render ALL components but hide inactive ones */}
        {/* This preserves component state (e.g., scroll position, API data) */}
        {tabs.map(({ key, Component }) => (
          <div
            key={key}
            role="tabpanel"
            id={`panel-${key}`}
            aria-labelledby={`tab-${key}`} // Links panel back to button
            className="tabbed-view-panel" // Added class for styling
            hidden={activeTab !== key} // Use 'hidden' attribute
          >
            <Component />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabbedView;