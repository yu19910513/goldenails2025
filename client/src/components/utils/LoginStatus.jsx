import React, { useEffect, useState } from 'react';
import { isTokenValid } from "../../utils/helper"


/**
 * A React component that conditionally displays either a login link or a logout link
 * based on the validity of a JWT token stored in localStorage.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.targetPath - The URL to navigate to (e.g., login or dashboard).
 * @param {string} props.targetText - The link text to display (e.g., "Login", "Dashboard").
 * @returns {JSX.Element} A link to `targetPath` if not logged in, or a dashboard link and logout option if logged in.
 */
const LoginStatus = ({ targetPath, targetText }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(isTokenValid(token));
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        window.location.href = '/';
    };

    return isLoggedIn ? (
        <>
            <a href={targetPath}>{targetText}</a> | <a href="#" onClick={handleLogout}>Logout</a>
        </>
    ) : (
        <a href={targetPath}>{targetText}</a>
    );
};


export default LoginStatus;
