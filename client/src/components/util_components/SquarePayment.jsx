import React, { useEffect, useState } from "react";
import PaymentService from "../../services/paymentService";

const SquarePayment = () => {
    const [payments, setPayments] = useState(null);
    const [card, setCard] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadSquarePayments = async () => {
            if (!window.Square) {
                setMessage("Square Payments SDK failed to load.");
                return;
            }

            try {
                const paymentsInstance = window.Square.payments(
                    "YOUR_SQUARE_APPLICATION_ID", // Replace with your actual Square Application ID
                    "sandbox" // Change to "production" when going live
                );

                setPayments(paymentsInstance);

                const cardInstance = await paymentsInstance.card();
                await cardInstance.attach("#card-container"); // Attach the card input field
                setCard(cardInstance);
            } catch (error) {
                console.error("Error initializing Square Payments:", error);
                setMessage("Error setting up payment. Check console for details.");
            }
        };

        loadSquarePayments();
    }, []);

    const handlePayment = async () => {
        if (!card) {
            setMessage("Card is not initialized.");
            return;
        }

        try {
            const result = await card.tokenize();
            if (result.status !== "OK") {
                setMessage("Payment tokenization failed. Please try again.");
                return;
            }

            const paymentResponse = await PaymentService.createPayment({
                sourceId: result.token,
                amount: 1000, // Amount in cents ($10.00)
                currency: "USD",
            })

            setMessage(`Payment successful! Payment ID: ${paymentResponse.data.payment.id}`);
        } catch (error) {
            console.error("Payment failed:", error);
            setMessage("Payment failed. Check console for details.");
        }
    };

    return (
        <div style={{ textAlign: "center", maxWidth: "400px", margin: "auto", padding: "20px" }}>
            <h2>Square Payment</h2>
            <div id="card-container" style={{ margin: "20px 0" }}></div> {/* Square inserts card fields here */}
            <button onClick={handlePayment} style={{ padding: "10px 20px", fontSize: "16px" }}>
                Pay $10.00
            </button>
            <p>{message}</p>
        </div>
    );
};

export default SquarePayment;
