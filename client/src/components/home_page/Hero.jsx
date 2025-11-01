import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MiscellaneousService from "../../services/miscellaneousService";
import AnnouncementBar from "./AnnouncementBar";
import "./Hero.css";

/**
 * Renders the hero section for the homepage.
 * It fetches and displays dynamic content like an ad board message,
 * a subtext, and an optional announcement bar.
 * It also includes static information (address, hours) and action buttons.
 */
const Hero = () => {
  const [adBoard, setAdBoard] = useState("Loading ad content...");
  const [subtext, setSubtext] = useState("");
  const [announcementBarPermission, setAnnouncementBarPermission] = useState(null);

  /**
   * Fetches initial data for the hero section on component mount.
   * This includes the ad board content, subtext, and permission
   * for displaying the announcement bar from the miscellaneous service.
   */
  useEffect(() => {
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
        const res = await MiscellaneousService.find("displayAnnouncementBar");
        setAnnouncementBarPermission(res.data && res.data.context === "on");
      } catch (error) {
        console.error("Error fetching AnnouncementBarPermission data:", error);
        setAnnouncementBarPermission(false);
      }
    };

    fetchAdBoardData();
    fetchSubtextData();
    fetchAnnouncementBarPermission();
  }, []);

  return (
    <section className="home-hero">
      {announcementBarPermission && (
        <div className="home-hero__announcement-bar">
          <AnnouncementBar />
        </div>
      )}
      <div className="home-hero__content-wrapper">
        <div className="home-hero__content">
          <h1 className="home-hero__title animate-goldenFadeIn">
            {adBoard || "Loading..."}
          </h1>
          <h2 className="home-hero__subtext animate-fadeIn">{subtext}</h2>

          <div className="home-hero__info">
            <p className="home-hero__info-text">
              3610 Grandview St, Gig Harbor, WA
            </p>
            <p className="home-hero__info-text">
              9 AM - 6:30 PM | Sun: 11 AM - 5 PM
            </p>
          </div>

          <div className="home-hero__actions">
            <a href="tel:+12538517563" className="home-hero__button home-hero__button--secondary">
              Call Us
            </a>

            <Link to="/bookingchoice" className="home-hero__button home-hero__button--primary">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;