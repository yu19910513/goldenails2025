import { useState } from "react";
import MiscellaneousService from "../services/miscellaneousService";
import "./ContactForm.css"; // Import CSS file for styling

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.message.trim()) newErrors.message = "Message cannot be empty";
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await MiscellaneousService.contactOwner(formData);
      alert("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      alert("Error sending message. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="contact-form-container">
      <h2 className="contact-title">Contact Us</h2>
      <p className="contact-subtitle">We’d love to hear from you! Fill out the form below, and we will respond to you via email within 12 hours.</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            className={`form-input ${errors.name ? "error" : ""}`}
          />
          {errors.name && <small className="error-text">{errors.name}</small>}
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email"
            className={`form-input ${errors.email ? "error" : ""}`}
          />
          {errors.email && <small className="error-text">{errors.email}</small>}
        </div>

        <div className="form-group">
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your Message"
            rows="4"
            className={`form-input ${errors.message ? "error" : ""}`}
          />
          {errors.message && <small className="error-text">{errors.message}</small>}
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? <span className="loader"></span> : "Send Message"}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
