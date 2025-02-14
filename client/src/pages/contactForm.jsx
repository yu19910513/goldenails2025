import { useState } from "react";
import MiscellaneousService from "../services/miscellaneousService";

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log(formData);

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    MiscellaneousService.contactOwner(formData);
    setTimeout(() => {
      alert("Message sent!");
      setLoading(false);
      setFormData({ name: "", email: "", message: "" });
    }, 1500);
  };

  return (
    <div className="p-4 max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
        Contact Us
      </h2>
      <p className="text-gray-600 mt-2">We’d love to hear from you! Fill out the form below.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your Message"
          rows="4"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg flex justify-center items-center gap-2"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}

export default ContactForm;
