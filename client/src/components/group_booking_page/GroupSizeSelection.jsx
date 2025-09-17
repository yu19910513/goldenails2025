import React, { useState } from 'react';

const GroupSizeSelection = ({ onBack, onNext }) => {
  // Default to 2 since it's a group booking
  const [groupSize, setGroupSize] = useState(2);

  const handleNext = () => {
    // Pass the selected group size to the parent component
    if (groupSize >= 2) {
      onNext(groupSize);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-8 bg-white bg-opacity-90 rounded-lg shadow-xl text-center max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          How many people are in your group?
        </h2>
        <p className="text-gray-600 mb-6">
          Please enter the total number of guests for this appointment.
        </p>
        
        <input
          type="number"
          min="2" // A group must have at least 2 people
          value={groupSize}
          onChange={(e) => setGroupSize(parseInt(e.target.value, 10))}
          className="w-full p-3 text-lg text-center border-2 border-gray-300 rounded-md focus:outline-none focus:border-pink-500"
          aria-label="Number of customers in the group"
        />

        <div className="mt-8 flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!groupSize || groupSize < 2}
            className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupSizeSelection;