import React, { useState } from "react";

const technicians = ["Alice", "Bob", "Charlie"];
const serviceCategories = {
  Hair: ["Haircut", "Coloring", "Styling"],
  Nails: ["Manicure", "Pedicure", "Nail Art"],
  Massage: ["Swedish", "Deep Tissue", "Hot Stone"],
};

const NewApptForm = () => {
  const [form, setForm] = useState({
    phone: "",
    name: "",
    email: "",
    date: "",
    time: "",
    technician: "",
    services: [{ category: "", service: "" }],
    sendSMS: false,
    sendEmail: false,
  });

  const handleServiceChange = (index, field, value) => {
    const newServices = [...form.services];
    newServices[index][field] = value;
    if (field === "category") newServices[index]["service"] = "";
    setForm({ ...form, services: newServices });
  };

  const addServiceRow = () => {
    setForm({ ...form, services: [...form.services, { category: "", service: "" }] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted form:", form);
    // Submit logic here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto p-4 shadow-lg rounded-xl bg-white">
      <h2 className="text-2xl font-bold mb-4">New Appointment</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="tel"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
          className="border rounded p-2 w-full"
        />
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="border rounded p-2 w-full"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border rounded p-2 w-full"
        />
        <select
          value={form.technician}
          onChange={(e) => setForm({ ...form, technician: e.target.value })}
          required
          className="border rounded p-2 w-full"
        >
          <option value="">Select Technician</option>
          {technicians.map((tech, i) => (
            <option key={i} value={tech}>{tech}</option>
          ))}
        </select>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
          className="border rounded p-2 w-full"
        />
        <input
          type="time"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          required
          className="border rounded p-2 w-full"
        />
      </div>

      <div>
        <label className="font-semibold block mb-2">Services</label>
        {form.services.map((service, index) => (
          <div key={index} className="flex gap-4 mb-2">
            <select
              value={service.category}
              onChange={(e) => handleServiceChange(index, "category", e.target.value)}
              required
              className="border rounded p-2 flex-1"
            >
              <option value="">Category</option>
              {Object.keys(serviceCategories).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={service.service}
              onChange={(e) => handleServiceChange(index, "service", e.target.value)}
              required
              className="border rounded p-2 flex-1"
              disabled={!service.category}
            >
              <option value="">Service</option>
              {serviceCategories[service.category]?.map((svc) => (
                <option key={svc} value={svc}>{svc}</option>
              ))}
            </select>
            {index === form.services.length - 1 && (
              <button
                type="button"
                onClick={addServiceRow}
                className="text-white bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.sendSMS}
            onChange={(e) => setForm({ ...form, sendSMS: e.target.checked })}
          />
          Send SMS
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.sendEmail}
            onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })}
          />
          Send Email
        </label>
      </div>

      <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
        Submit
      </button>
    </form>
  );
};

export default NewApptForm;
