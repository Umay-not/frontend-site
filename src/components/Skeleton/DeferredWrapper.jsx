import { useState, useEffect } from 'react';

const DeferredWrapper = ({ children, delay = 300 }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    if (!show) {
        // Return a placeholder that takes up space to push footer down
        // but shows nothing (white screen effect)
        return <div className="deferred-loading-placeholder"></div>;
    }

    return children;
};

export default DeferredWrapper;
