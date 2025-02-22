import { useState } from "react";
import AuthenticationService from "../../services/authenticationService";

const PasswordlessLogin = () => {
  const [identifier, setIdentifier] = useState("");
  const [passcode, setPasscode] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const handleSendPasscode = async () => {
    setError("");
    try {
      const response = await AuthenticationService.send_code(identifier)
      const data = await response.json();
      if (response.ok) {
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
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/"; // Redirect to the next page
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
          <input
            type="text"
            className="border p-2 rounded w-full mb-2"
            placeholder="Enter email or phone number"
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