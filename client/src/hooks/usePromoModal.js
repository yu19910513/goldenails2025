import { useState, useEffect } from 'react';
import MiscellaneousService from '../services/miscellaneousService';

/**
 * The key used to store the viewed promo version in localStorage and sessionStorage.
 */
const STORAGE_KEY = 'activePromoKey';

/**
 * A custom React hook to manage the visibility of a promotional modal.
 * * This hook handles all the logic for determining if the modal should be shown,
 * based on a remote feature flag, a remote promo key (version), and the user's
 * local/session storage.
 * * @returns {[boolean, Function]} A tuple containing:
 * - `showModal` (boolean): Whether the modal should be currently visible.
 * - `handleCloseModal` (Function): A callback function to close the modal and update storage.
 */
export const usePromoModal = () => {
    const [showModal, setShowModal] = useState(false);
    const [currentPromoKey, setCurrentPromoKey] = useState(null);

    useEffect(() => {
        let timerId = null;

        /**
         * Fetches promo settings from the API and checks storage to decide
         * if the modal should be displayed.
         */
        const checkPromoStatus = async () => {
            let switchValue = false;
            let apiPromoKey = null;

            try {
                // Fetch the remote switch and key values in parallel
                const [switchResponse, keyResponse] = await Promise.all([
                    MiscellaneousService.find('promo_switch'),
                    MiscellaneousService.find('promo_key')
                ]);

                // Use `context` field from API response
                switchValue = switchResponse.data?.context === "true";
                apiPromoKey = keyResponse.data?.context;

                if (apiPromoKey) {
                    setCurrentPromoKey(apiPromoKey);
                }

            } catch (error) {
                console.error("Failed to fetch promo settings:", error);
                return; // Fail-safe: don't show modal if API fails
            }
            
            // If the remote switch is OFF, reset the session and hide
            if (!switchValue) {
                sessionStorage.removeItem(STORAGE_KEY);
                return;
            }

            // If the switch is ON but no key was provided, warn and hide
            if (!apiPromoKey) {
                console.warn("Promo switch is ON, but no 'promo_key' was provided.");
                return;
            }

            const localPromoKey = localStorage.getItem(STORAGE_KEY);
            const sessionPromoKey = sessionStorage.getItem(STORAGE_KEY);

            // Don't show if key exists in localStorage (e.g., from booking)
            if (localPromoKey && localPromoKey === apiPromoKey) {
                sessionStorage.setItem(STORAGE_KEY, localPromoKey); // "Heal" session
                return;
            }

            // Don't show if key exists in sessionStorage (e.g., from previous dismiss)
            if (sessionPromoKey && sessionPromoKey === apiPromoKey) {
                return;
            }

            // If we get here, user is new or has seen an old key. Show the modal.
            timerId = setTimeout(() => {
                setShowModal(true);
            }, 1500);
        };

        checkPromoStatus();

        // Cleanup the timer if the component unmounts before it fires
        return () => {
            if (timerId) {
                clearTimeout(timerId);
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    /**
     * Callback function to close the modal and save the current promo key
     * to sessionStorage.
     */
    const handleCloseModal = () => {
        setShowModal(false);

        if (currentPromoKey) {
            sessionStorage.setItem(STORAGE_KEY, currentPromoKey);
        }
    };

    return [showModal, handleCloseModal];
};
