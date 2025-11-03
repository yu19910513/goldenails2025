import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isTokenValid } from "../../utils/helper";

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
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(isTokenValid(token));
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/');
    };

    return isLoggedIn ? (
        <>
            <Link to={targetPath}>{targetText}</Link> |{' '}
            <Link to="#" onClick={handleLogout}>Logout</Link>
        </>
    ) : (
        <Link to={targetPath}>{targetText}</Link>
    );
};

export default LoginStatus;
