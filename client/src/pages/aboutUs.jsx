import React, { useEffect } from "react";
import "./aboutUs.css";

const timelineData = [
    {
        year: "1994",
        title: "Immigration to Seattle",
        description:
            "Our founders immigrated to Seattle through the HO program after the Vietnam War. In their mid-forties, with grown children, they started over with little more than determination.",
        image: "/images/timeline-1994.jpg",
    },
    {
        year: "2000",
        title: "Founding Golden Nails",
        description:
            "They sold all their gold savings to open their first nail salon in Seattle, naming it Golden Nails — a tribute to sacrifice and perseverance.",
        image: "/images/timeline-2000-placeholder.jpg",
    },
    {
        year: "2002",
        title: "Early Struggles",
        description:
            "The recession hit hard, but through perseverance and community support, Golden Nails survived and grew stronger.",
        image: "/images/timeline-2002-placeholder.jpg",
    },
    {
        year: "2008",
        title: "Move to Gig Harbor",
        description:
            "The family moved to a quieter town, selling the Seattle location but continuing the legacy with a new salon in Gig Harbor.",
        image: "/images/timeline-2008-placeholder.jpg",
    },
    {
        year: "2019",
        title: "Lisa's Ownership",
        description:
            "Under Lisa, the salon expanded and modernized, building strong customer relationships while keeping the family values intact.",
        image: "/images/timeline-2019-placeholder.jpg",
    },
    {
        year: "2024",
        title: "Full Circle",
        description:
            "The founders’ granddaughter, June, and her husband, Rex, took over the salon alongside June’s mother, Tracy, continuing the family legacy.",
        image: "/images/timeline-2024-placeholder.jpg",
    },
];

const AboutUs = () => {
    useEffect(() => {
        const elements = document.querySelectorAll(".aboutus-fade");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("aboutus-visible");
                    }
                });
            },
            { threshold: 0.2 }
        );

        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="aboutus-wrapper">
            {/* Hero Section */}
            <div className="aboutus-hero aboutus-fade">
                <img
                    src="/images/aboutus-hero-placeholder.jpg"
                    alt="Golden Nails legacy"
                    className="aboutus-hero-image"
                />
                <div className="aboutus-hero-overlay">
                    <h1 className="aboutus-hero-title">About Us</h1>
                    <p className="aboutus-hero-subtitle">
                        More than a salon — a story of family, resilience, and legacy.
                    </p>
                </div>
            </div>

            {/* Split Sections */}
            <div className="aboutus-section aboutus-fade">
                <div className="aboutus-image">
                    <img
                        src="/images/aboutus-founders-placeholder.jpg"
                        alt="Founders of Golden Nails"
                    />
                </div>
                <div className="aboutus-content">
                    <h2>Our Journey</h2>
                    <p>
                        Our story began in 1994, when our founders immigrated to Seattle
                        through the HO program after the Vietnam War. Already in their
                        mid-forties, with grown children, they started over with little more
                        than determination.
                    </p>
                    <p>
                        For nearly a decade they worked in Chinatown restaurants — the
                        husband as a dishwasher, the wife as a waitress. Every dollar saved
                        went into small pieces of gold, their only wealth and security.
                    </p>
                    <p>
                        By the early 2000s, they sold that gold to pursue a dream of their
                        own. With those savings, they opened{" "}
                        <span className="aboutus-highlight">Golden Nails</span> in Seattle —
                        a tribute to sacrifice and perseverance.
                    </p>
                </div>
            </div>

            <div className="aboutus-section reverse aboutus-fade">
                <div className="aboutus-content">
                    <h2>Legacy Through Generations</h2>
                    <p>
                        From the early struggles of the 2002 recession to years of growth,
                        Golden Nails became a beloved name in Seattle. The original salon
                        still stands near the Space Needle, a reminder of where the journey
                        began.
                    </p>
                    <p>
                        In 2008, the family moved to Gig Harbor for a slower pace of life.
                        Dedicated owners like Helen and Lisa helped carry the Golden Nails
                        tradition forward, expanding and modernizing the salon while
                        preserving its spirit.
                    </p>
                </div>
                <div className="aboutus-image">
                    <img
                        src="/images/aboutus-legacy-placeholder.jpg"
                        alt="Golden Nails legacy continues"
                    />
                </div>
            </div>

            <div className="aboutus-section aboutus-fade">
                <div className="aboutus-image">
                    <img
                        src="/images/aboutus-family-placeholder.jpg"
                        alt="Family carrying on the Golden Nails legacy"
                    />
                </div>
                <div className="aboutus-content">
                    <h2>Golden Nails Today</h2>
                    <p>
                        In 2024, the story came full circle. The founders’ granddaughter,
                        June, and her husband, Rex, took over Golden Nails in Gig Harbor,
                        alongside June’s mother, Tracy, who manages daily operations.
                    </p>
                    <p>
                        Though June is an engineer and Rex a pharmacist, their commitment to
                        family legacy guides every step. With Tracy’s experience, Helen’s
                        loyalty, and Lisa’s influence, Golden Nails continues to thrive.
                    </p>
                    <p className="aboutus-quote">
                        “Golden Nails isn’t just a name. It’s a story — of sacrifice,
                        perseverance, and beauty passed down through generations.”
                    </p>
                </div>
            </div>

            {/* Timeline Section */}
            <div className="aboutus-timeline-section aboutus-fade">
                <h2 className="aboutus-timeline-heading">Timeline</h2>
                <div className="aboutus-timeline-container">
                    {timelineData.map((item, index) => (
                        <div
                            className={`aboutus-timeline-item ${index % 2 === 0 ? "left" : "right"
                                }`}
                            key={item.year}
                        >
                            <div className="aboutus-timeline-content">
                                <h3>
                                    {item.year} - {item.title}
                                </h3>
                                <p>{item.description}</p>
                            </div>
                            <div className="aboutus-timeline-image">
                                <img src={item.image} alt={item.title} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
