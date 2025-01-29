import { forwardRef, useImperativeHandle, useRef } from "react";
import Button from "./Button";
import "../../style/Login.css"; // Link to an external CSS file for styling

const Modal = forwardRef(function Modal(
  { title, children, size, Button1 = null, Button2 = null, onClose },
  ref
) {
  const dialog = useRef();
  let maxSize;

  // Determine the max size of the modal based on the size prop
  switch (size) {
    case "small":
      maxSize = "600px";
      break;
    case "medium":
      maxSize = "720px";
      break;
    case "large":
      maxSize = "1024px";
      break;
    case "full":
      maxSize = "100%";
      break;
    default:
      maxSize = "600px"; // Default to small size if no size prop is passed
  }

  // Expose the open and close methods to parent components
  useImperativeHandle(ref, () => {
    return {
      open() {
        dialog.current.showModal(); // Open the dialog
      },
      close() {
        dialog.current.close(); // Close the dialog
      },
    };
  });

  return (
    <dialog
      ref={dialog}
      className="custom-modal rounded-4" // Apply the custom modal CSS class
      style={{ maxWidth: maxSize }}
    >
      <div className="custom-modal-header " style={{fontWeight:'600'}}>{title}</div>
      <hr className="custom-divider" />
      <div className="custom-modal-body">{children}</div>
      <hr className="custom-divider" />
      <div className="custom-modal-footer">
        <form method="dialog">
          {Button1}
          {Button2}
          <div className="tutup">
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose(); // Call the onClose function passed from the parent
                dialog.current.close(); // Close the modal
              }}
            >
              Tutup
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
});

export default Modal;
