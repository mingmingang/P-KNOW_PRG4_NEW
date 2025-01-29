import React, { useEffect, useState } from "react";
import "../../style/Loading.css"; // Your custom styles for the loading spinner

const Loading = ({ timeout = 3000 }) => {
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    // Set a timeout to stop showing the loader after the specified time
    const timer = setTimeout(() => {
      setIsTimeout(true);
    }, timeout);

    // Clear timeout if component is unmounted
    return () => clearTimeout(timer);
  }, [timeout]);

  return (
    <div className="loading-spinner">
      {isTimeout ? (
        <div className="timeout-message">
          <span>Loading took longer than expected...</span>
        </div>
      ) : (
        <div className="spinner"></div>
      )}
    </div>
  );
};

export default Loading;
