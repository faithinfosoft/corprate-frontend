import React from "react";
import Modal from "react-bootstrap/Modal";

const CustomModal = ({
  show,
  onHide,
  title,
  children,
  onSubmit,
  isSaving,
}) => {
  return (
    <Modal show={show} onHide={onHide} size="xxl">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
       
          {children}
         
      </Modal.Body>
    </Modal>
  );
};

export default CustomModal;