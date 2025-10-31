import { useNavigate } from 'react-router-dom';
import './PromoModal.css';

/**
 * PromoModal Component
 *
 * This component displays a promotional modal with a flyer image and a "Book Now" button.
 * It also includes a close (X) button in the top-right corner and closes when
 * clicking outside the modal content.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.show - Determines whether the modal is visible. When false, nothing is rendered.
 * @param {function} props.onClose - Callback function to close the modal.
 *
 * @example
 * <PromoModal show={isModalVisible} onClose={() => setModalVisible(false)} />
 *
 * Behavior:
 * - Clicking the overlay (outside the modal content) calls `onClose`.
 * - Clicking the "X" button calls `onClose`.
 * - Clicking the "Book Now" button closes the modal and navigates to `/bookingchoice`.
 */
function PromoModal({ show, onClose }) {
    const flyerImage = "images/promo.PNG";
    const navigate = useNavigate();

    // Do not render the modal if show is false
    if (!show) {
        return null;
    }

    /**
     * Stops click events from propagating to the overlay.
     * Prevents the modal from closing when clicking inside the content area.
     *
     * @param {React.MouseEvent} e - The click event
     */
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    /**
     * Handles the "Book Now" button click.
     * Closes the modal and navigates the user to the booking choice page.
     */
    const handleBookNow = () => {
        onClose();
        navigate('/bookingchoice');
    };

    return (
        <div className="promo-modal-overlay" onClick={onClose}>
            <div className="promo-modal-content" onClick={handleContentClick}>
                <button className="promo-modal-close-btn" onClick={onClose}>
                    &times;
                </button>

                <img
                    src={flyerImage}
                    alt="Beauty & Spa Special Offer"
                    className="promo-modal-image"
                />

                <button
                    className="promo-modal-book-btn"
                    onClick={handleBookNow}
                >
                    Book Now
                </button>
            </div>
        </div>
    );
}

export default PromoModal;
