import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthenticationService from "../services/authenticationService";

const PasswordlessLogin = () => {
  const [identifier, setIdentifier] = useState("");
  const [passcode, setPasscode] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = token.split(".")[1];
        if (payload) {
          const decodedToken = JSON.parse(atob(payload));
          const currentTime = Math.floor(Date.now() / 1000);
          if (decodedToken.exp && decodedToken.exp < currentTime) {
            console.log("Token expired, logging out.");
            localStorage.removeItem("token");
          } else {
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Error parsing token", error);
        localStorage.removeItem("token");
      }
    }
  }, [navigate, location.pathname]);

  const validateInput = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10}$/; // 10-digit phone number

    if (emailRegex.test(identifier)) return "email";
    if (phoneRegex.test(identifier)) return "phone";

    setError("Invalid email or phone number.");
    return null;
  };

  const handleSendPasscode = async () => {
    setError("");
    const inputType = validateInput();
    if (!inputType) return;

    try {
      const response = await AuthenticationService.send_code(identifier);
      if (response.status === 200) {
        setStep(2);
      } else {
        // setError(response.data.message || "Failed to send passcode."); **according to Axios, non-200 codes are all considered error, and will be thrown
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    }
  };

  const handleVerifyPasscode = async () => {
    setError("");
    try {
      const response = await AuthenticationService.verify_passcode(identifier, passcode);
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        navigate(location.state?.from || "/", { replace: true });
      }
      else {
        //   setError(response.data.message || "Invalid passcode"); **according to Axios, non-200 codes are all considered error, and will be thrown
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
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
            Enter your registered email or 10-digit phone number. We'll send you a one-time passcode.
          </p>
          <input
            type="text"
            className="border p-2 rounded w-full mb-2"
            placeholder="Enter email or phone number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value.trim())}
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
            type="password"
            className="border p-2 rounded w-full mb-2"
            placeholder="Enter passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value.trim())}
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
};

export default PasswordlessLogin;
