import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./AnnouncementBar.css"; // Import the CSS file
import MiscellaneousService from "../../services/miscellaneousService"

const AnnouncementBar = () => {
  const [announcementContext, setAnnouncementContext] = useState("");

  useEffect(() => {
    const fetchAnnouncementContext = async () => {
      try {
        const announcementContextResponse = await MiscellaneousService.find("announcementContext");
        if (announcementContextResponse.data) {
          setAnnouncementContext(announcementContextResponse.data.context);
        }
      } catch (error) {
        console.error("Error fetching announcementContext data:", error);
        setAnnouncementContext(false);
      }
    };

    fetchAnnouncementContext();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="announcement-bar"
    >
      <motion.div
        className="announcement-text-wrapper"
        animate={{ x: ["100%", "-100%"] }} // Move left
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }} // Loop seamlessly
      >
        <span className="announcement-text">
          {announcementContext}
        </span>
        <span className="announcement-text">
          {announcementContext}
        </span>
      </motion.div>
    </motion.div>
  );
}

export default AnnouncementBar;