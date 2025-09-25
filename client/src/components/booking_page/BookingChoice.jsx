import React from "react";
import { useNavigate } from "react-router-dom";

const BookingChoice = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">
                Choose Your Booking Type
            </h1>

            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => navigate("/booking")}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-2xl shadow hover:bg-blue-700 transition"
                >
                    Single Booking
                </button>
                <button
                    onClick={() => navigate("/groupbooking")}
                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-2xl shadow hover:bg-green-700 transition"
                >
                    Group Booking
                </button>
            </div>

            <p className="text-sm text-gray-600 max-w-md text-center">
                Reminder: Group booking can be changed back to single booking later by
                adjusting the group size to 1.
            </p>
        </div>
    );
}


export default BookingChoice