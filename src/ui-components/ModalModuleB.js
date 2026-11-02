// ModalModuleB.js
import React from 'react';

const ModalModuleB = ({ category, items, onSubmit, isSaving, onClose }) => {
  return (
    <div>
      <h5>Module B Modal</h5>
      {/* Your form for module B goes here */}
      <form onSubmit={onSubmit}>
        <button type="submit" disabled={isSaving}>Submit</button>
        <button type="button" onClick={onClose}>Close</button>
      </form>
    </div>
  );
};

export default ModalModuleB;
