import { useState } from "react";
import AuthenticationService from "../services/authenticationService";

const PasswordlessLogin = (location) => {
  const [identifier, setIdentifier] = useState("");
  const [passcode, setPasscode] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const validateInput = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10}$/; // 10-digit phone number (e.g., 2532229800)

    if (emailRegex.test(identifier)) {
      return "email";
    } else if (phoneRegex.test(identifier)) {
      return "phone";
    } else {
      setError("Invalid email or phone number.");
      return null;
    }
  };

  const handleSendPasscode = async () => {
    setError("");

    const inputType = validateInput();
    if (!inputType) return;

    try {
      const response = await AuthenticationService.send_code(identifier);
      const data = response.data;
      if (response.status === 200) {
        setStep(2);
      } else {
        setError(data.message || "Failed to send passcode");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  };

  const handleVerifyPasscode = async () => {
    setError("");
    try {
      const response = await AuthenticationService.verify_passcode(identifier, passcode);
      console.log(response);

      const data = response.data;
      if (response.status === 200) {
        localStorage.setItem("token", data.token);
        window.location.href = location; // Redirect to the next page
      } else {
        setError(data.message || "Invalid passcode");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-md mx-auto border rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">
        {step === 1 ? "Login" : "Enter Passcode"}
      </h2>

      {step === 1 && (
        <>
          <p className="text-sm text-gray-600 mb-2">
            Please enter your registered email address or 10-digit phone number (no dashes). For example, you can enter youremail@example.com or 1234567890. We will send you a one-time passcode to log in via the email or phone number you provide.
          </p>
          <input
            type="text"
            className="border p-2 rounded w-full mb-2"
            placeholder="Enter your email or phone number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <button
            onClick={handleSendPasscode}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
          >
            Send Passcode
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            type="text"
            className="border p-2 rounded w-full mb-2"
            placeholder="Enter passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
          />
          <button
            onClick={handleVerifyPasscode}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
          >
            Verify & Login
          </button>
        </>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default PasswordlessLogin;