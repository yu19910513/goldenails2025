import React from "react";
import { useNavigate } from "react-router-dom";

const BookingChoice = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">
                    Choose Your Booking Experience
                </h1>
                <p className="mt-2 text-slate-600">Select the option that's right for you.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-8 w-full max-w-4xl">
                {/* Single Booking Card */}
                <div className="flex-1 p-6 bg-white rounded-xl shadow-md text-center flex flex-col">
                    <h2 className="text-xl font-semibold text-slate-900">Single Booking</h2>
                    <p className="mt-2 text-sm text-slate-600 flex-grow">
                        The classic, step-by-step process. Perfect for when you want to select a specific technician.
                    </p>
                    <button
                        onClick={() => navigate("/booking")}
                        className="mt-4 w-full px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        Book Single
                    </button>
                </div>

                {/* Group Booking Card */}
                <div className="flex-1 p-6 bg-white rounded-xl shadow-md text-center border-2 border-green-500 flex flex-col">
                    <h2 className="text-xl font-semibold text-slate-900 relative">
                        Group Booking
                        <span className="absolute -top-3 -right-3 text-xs font-bold text-white bg-red-500 rounded-full px-2 py-1">NEW</span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 flex-grow">
                        Our fastest option for individuals or groups. We'll find the best technicians for you automatically.
                    </p>
                    <button
                        onClick={() => navigate("/groupbooking")}
                        className="mt-4 w-full px-6 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition"
                    >
                        Book Group
                    </button>
                </div>
            </div>

            <p className="text-sm text-slate-600 max-w-lg text-center">
                <strong>Tip:</strong> You can use Group Booking for just one person! It's our most streamlined way to find an appointment.
            </p>
        </div>
    );
}

export default BookingChoice;