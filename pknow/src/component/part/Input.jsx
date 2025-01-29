// Input.jsx
import React, { forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    label = "",
    forInput,
    type = "text",
    placeholder = "",
    isRequired = false,
    isDisabled = false,
    errorMessage,
    ...props
  },
  ref
) {
  return (
    <>
      {label !== "" && (
        <div className="mb-3">
          <label htmlFor={forInput} className="form-label fw-bold">
            {label}
            {isRequired ? <span className="text-danger"> *</span> : ""}
            {errorMessage ? (
              <span className="fw-normal text-danger"> {errorMessage}</span>
            ) : (
              ""
            )}
          </label>
          {type === "textarea" ? (
            <textarea
              rows="5"
              id={forInput}
              name={forInput}
              className="form-control"
              placeholder={placeholder}
              ref={ref}
              disabled={isDisabled}
              {...props}
            ></textarea>
          ) : (
            <input
              id={forInput}
              name={forInput}
              type={type}
              className="form-control"
              placeholder={placeholder}
              ref={ref}
              disabled={isDisabled}
              {...props}
            />
          )}
        </div>
      )}
      {label === "" && (
        <>
        {errorMessage && (
            <span className="small ms-1 text-danger">
              {
                errorMessage}
            </span>
          )}
          {type === "textarea" ? (
            <textarea
              rows="5"
              id={forInput}
              name={forInput}
              className="form-control"
              placeholder={placeholder}
              ref={ref}
              disabled={isDisabled}
              {...props}
            ></textarea>
          ) : (
            <input
              id={forInput}
              name={forInput}
              type={type}
              className="form-control"
              placeholder={placeholder}
              ref={ref}
              disabled={isDisabled}
              {...props}
            />
          )}
          
        </>
      )}
    </>
  );
});

export default Input;
