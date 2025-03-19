import React, { useState, useEffect } from "react";
import MiscellaneousService from "../../services/miscellaneousService";
import AnnouncementBar from "./AnnouncementBar"; // Import the new component
import { business_hours, convertTo12Hour } from "../../common/utils";
import "./Hero.css";

const Hero = () => {
  const [adBoard, setAdBoard] = useState("Loading ad content...");
  const [subtext, setSubtext] = useState("");
  const [announcementBarPermission, setAnnouncementBarPermission] = useState(null);
  const [operationHours, setOperationHours] = useState({ start: null, end: null });
  const [sundayHours, setSundayHours] = useState({ start: null, end: null });

  useEffect(() => {

    const fetchHours = async (day = "") => {
      try {
        const hours = await business_hours(day);
        if (day === "sunday") {
          setSundayHours(hours);
        } else {
          setOperationHours(hours);
        }
      } catch (error) {
        console.error(`Error fetching ${day || "operation"} hours data:`, error);
      }
    };

    const fetchAdBoardData = async () => {
      try {
        const adBoardResponse = await MiscellaneousService.find("adBoard");
        setAdBoard(adBoardResponse.data.context || "Default ad board message");
      } catch (error) {
        console.error("Error fetching adBoard data:", error);
        setAdBoard("Polish, Pamper, Perfection");
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

    const fetchAnnouncementBarPermission = async () => {
      try {
        const announcementBarPermissionResponse = await MiscellaneousService.find("displayAnnouncementBar");
        if (announcementBarPermissionResponse.data && announcementBarPermissionResponse.data.context === "on") {
          setAnnouncementBarPermission(true);
        } else {
          setAnnouncementBarPermission(false);
        }
      } catch (error) {
        console.error("Error fetching AnnouncementBarPermission data:", error);
        setAnnouncementBarPermission(false);
      }
    };

    fetchHours();
    fetchHours("sunday");
    fetchAdBoardData();
    fetchSubtextData();
    fetchAnnouncementBarPermission();
  }, []);

  return (
    <section className="relative hero bg-cover bg-center h-screen text-center text-white flex items-center justify-center p-10 font-serif">
      {announcementBarPermission && (
        <div className="announcement-bar-container">
          <AnnouncementBar />
        </div>
      )}
      <div className="p-8 rounded-lg max-w-3xl animate-fadeIn mx-auto lg:mr-20">
        <h1 className="adBoard text-5xl font-extrabold mb-8 drop-shadow-lg animate-goldenFadeIn">
          {adBoard || "Loading..."}
        </h1>
        <h2 className="mb-6 animate-fadeIn subtext">{subtext}</h2>

        <div className="mb-8 info-section mt-20" style={{ fontFamily: "Optima, arial", color: "#06402B" }}>
          <p className="text-lg font-medium mb-2">
            3610 Grandview St, Gig Harbor, WA
          </p>
          <p className="text-lg font-medium">
            Open Hours: {convertTo12Hour(operationHours.start)} AM - {convertTo12Hour(operationHours.end)} PM | Sun: {convertTo12Hour(sundayHours.start)} AM - {convertTo12Hour(sundayHours.end)} PM
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
