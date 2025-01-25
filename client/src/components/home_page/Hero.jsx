import React, { useState, useEffect } from "react";
import MiscellaneousService from "../../services/miscellaneousService";
import "./Hero.css";

const Hero = () => {
  const [adBoard, setAdBoard] = useState("Loading ad content..."); // Default loading state for adBoard
  const [subtext, setSubtext] = useState(""); // Default loading state for subtext

  useEffect(() => {
    const fetchAdBoardData = async () => {
      try {
        const adBoardResponse = await MiscellaneousService.find("adBoard");
        setAdBoard(adBoardResponse.data.context || "Default ad board message");
      } catch (error) {
        console.error("Error fetching adBoard data:", error);
        setAdBoard("Polish, Pamper, Perfection"); // Fallback message for adBoard
      }
    };

    const fetchSubtextData = async () => {
      try {
        const subtextResponse = await MiscellaneousService.find("subtext");
        setSubtext(subtextResponse.data.context || "");
      } catch (error) {
        console.error("Error fetching subtext data:", error);
      }
    };

    // Fetch both adBoard and subtext independently
    fetchAdBoardData();
    fetchSubtextData();
  }, []);

  return (
    <section className="hero bg-cover bg-center h-screen text-center text-white flex items-center justify-center p-10 font-serif">
      <div className="p-8 rounded-lg max-w-3xl animate-fadeIn mx-auto lg:mr-20">
        <h1 className="adBoard text-5xl font-extrabold mb-8 drop-shadow-lg animate-goldenFadeIn">
          {adBoard || "Loading..."} {/* Display adBoard data or a loading message */}
        </h1>
        {/* Subtext added here */}
        <h2 className="mb-6 animate-fadeIn subtext">
          {subtext}
        </h2>

        <div className="mb-8 info-section mt-20" style={{ fontFamily: "Optima, arial", color: "#06402B" }}>
          <p className="text-lg font-medium mb-2">
            3610 Grandview St, Gig Harbor, WA
          </p>
          <p className="text-lg font-medium">
            Open Hours: 9 AM - 6:30 PM | Sun: Appt. Only
          </p>
        </div>

        <div className="button-group">
          <a href="tel:+12538517563">Call Us Now</a>
          <a href="/booking">Book Now</a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
