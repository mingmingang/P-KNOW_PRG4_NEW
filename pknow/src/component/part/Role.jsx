import { Link } from "react-router-dom";
import "../../style/Login.css";
import Modal from "./Modal"; // Importing your custom Modal component
import Button from "./Button"; // Importing the Button component for use within the Modal

export default function Role({ showModal,onClose }) {
  const modalRef = useRef();

  if (showModal) {
    modalRef.current?.open();
  } else {
    modalRef.current?.close();
  }

  return (
    <Modal
      ref={modalRef}
      title="Pilih Peran"
      size="medium"
      Button1={
        <Button
          classType="primary"
          label="Confirm"
          onClick={() => {
            modalRef.current.close();
            onClose(); // Closing the modal when the user confirms
          }}
        />
      }
    >
    </Modal>
  );
}
