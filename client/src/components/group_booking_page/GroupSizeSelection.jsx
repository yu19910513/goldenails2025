import React, { useState } from 'react';

/**
 * GroupSizeSelection component
 *
 * Renders a simple UI for selecting the number of people in a group
 * (between 1 and 4). The selection is passed to the parent via the
 * `onNext` callback when the "Next" button is clicked.
 *
 * @component
 *
 * @param {Object} props - Component props.
 * @param {Function} props.onNext - Callback fired with the selected group size when the user proceeds.
 *
 * @example
 * <GroupSizeSelection onNext={(size) => console.log("Selected size:", size)} />
 *
 * @returns {JSX.Element} The rendered GroupSizeSelection component.
 */
const GroupSizeSelection = ({ onNext }) => {
  /**
   * State for the current group size selection.
   * Defaults to 2.
   *
   * @type {[number, Function]}
   */
  const [groupSize, setGroupSize] = useState(2);

  /** @type {number[]} The selectable group size options (1–4). */
  const options = [1, 2, 3, 4];

  /**
   * Handles the "Next" button click.
   * Passes the currently selected group size to the parent via `onNext`.
   *
   * @returns {void}
   */
  const handleNext = () => {
    onNext(groupSize);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-8 bg-white bg-opacity-90 rounded-lg shadow-xl text-center max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          How many people are in your group?
        </h2>
        <p className="text-gray-600 mb-6">
          Please select the total number of guests (1-4).
        </p>

        {/* Group size dropdown */}
        <select
          value={groupSize}
          onChange={(e) => setGroupSize(parseInt(e.target.value, 10))}
          className="w-full p-3 text-lg text-center border-2 border-gray-300 rounded-md focus:outline-none focus:border-pink-500"
          aria-label="Number of people in the group"
        >
          {options.map((number) => (
            <option key={number} value={number}>
              {number}
            </option>
          ))}
        </select>

        <div className="mt-8 flex justify-between">
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupSizeSelection;