import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import "../../style/Button.css"; // Import your custom CSS

export default function Button({ buttons = [], filterOptions = [], filterFields = [] }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleButtonClick = (path) => {
    if (path) {
      navigate(path); // Use navigate function to go to the provided path
    }
  };

  return (
    <div className="button-container">
      {buttons.map((button, index) => (
        <div key={index} className="button-wrapper">
          {/* Check if the button is the filter button */}
          {button.label === "Filter" ? (
            <>
              <button
                className={`custom-button ${button.className}`}
                onClick={toggleDropdown}
              >
                <i className={`${button.icon} icon`}></i> {button.label}
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="dropdown-filter">
                  <label htmlFor="sortSelect">Urutkan Berdasarkan:</label>
                  {/* Dynamically render comboboxes */}
                  {filterFields.map((field, idx) => (
                    <div key={idx} className="filter-field">
                      <label htmlFor={field.id} style={{ fontWeight: '600' }}>
                        {field.label}
                      </label>
                      <select id={field.id} className="sort-select">
                        {field.options.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Regular button without dropdown
            <button
              className={`custom-button ${button.className}`}
              onClick={() => handleButtonClick(button.path)} // Use navigate for path
            >
              <i className={`${button.icon} icon`}></i> {button.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
