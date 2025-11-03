import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * A component that automatically scrolls the window to the top (0, 0)
 * whenever the route path (pathname) changes.
 *
 * This component should be rendered once within the React Router's
 * `Router` component to ensure it can access location changes.
 *
 * @returns {null} This component does not render any visual output.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
