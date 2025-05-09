import React, { forwardRef, useRef, useEffect } from "react";

const Input = forwardRef(function Input(
  {
    label = "",
    forInput,
    type = "text",
    placeholder = "",
    isRequired = false,
    isDisabled = false,
    errorMessage,
    value,
    onChange,
    ...props
  },
  ref
) {
  const inputRef = useRef(null);
  const cursorPositionRef = useRef(0);

  // Daftar input yang tidak mendukung selection range
  const noSelectionTypes = ["checkbox", "radio", "file", "button", "submit", "reset", "number"];

  // Simpan posisi kursor sebelum perubahan value (hanya jika memungkinkan)
  const handleChange = (e) => {
    if (!noSelectionTypes.includes(type) && e.target.selectionStart !== null) {
      cursorPositionRef.current = e.target.selectionStart;
    }
    if (onChange) onChange(e);
  };

  // Kembalikan posisi kursor setelah re-render (jika memungkinkan)
  useEffect(() => {
    if (
      inputRef.current &&
      !noSelectionTypes.includes(type) &&
      typeof cursorPositionRef.current === "number"
    ) {
      try {
        inputRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
      } catch (error) {
        console.warn("Selection not supported for input type:", type);
      }
    }
  }, [value, type]);

  return (
    <>
      {label !== "" && (
        <div className="mb-3">
          <label htmlFor={forInput} className="form-label fw-bold">
            {label}
            {isRequired ? <span className="text-danger"> *</span> : ""}
            {errorMessage ? <span className="fw-normal text-danger"> {errorMessage}</span> : ""}
          </label>
          {type === "textarea" ? (
            <textarea
              rows="5"
              id={forInput}
              name={forInput}
              className="form-control"
              placeholder={placeholder}
              ref={ref || inputRef}
              disabled={isDisabled}
              value={value}
              onChange={handleChange}
              {...props}
            ></textarea>
          ) : (
            <input
              id={forInput}
              name={forInput}
              type={type}
              className="form-control"
              placeholder={placeholder}
              ref={ref || inputRef}
              disabled={isDisabled}
              value={value}
              onChange={handleChange}
              {...props}
            />
          )}
        </div>
      )}
      {label === "" && (
        <>
          {errorMessage && <span className="small ms-1 text-danger">{errorMessage}</span>}
          {type === "textarea" ? (
            <textarea
              rows="5"
              id={forInput}
              name={forInput}
              className="form-control"
              placeholder={placeholder}
              ref={ref || inputRef}
              disabled={isDisabled}
              value={value}
              onChange={handleChange}
              {...props}
            ></textarea>
          ) : (
            <input
              id={forInput}
              name={forInput}
              type={type}
              className="form-control"
              placeholder={placeholder}
              ref={ref || inputRef}
              disabled={isDisabled}
              value={value}
              onChange={handleChange}
              {...props}
            />
          )}
        </>
      )}
    </>
  );
});

export default Input;
