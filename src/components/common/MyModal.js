import React from "react";
import svg from "../svg";

function MyModal({ children, shown, close }) {
  return shown ? (
    <div
      className="modal-backdrop"
      onClick={() => {
        close();
      }}
    >
      <div
        className="modal-content"
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <a className="rz_closeIcon" onClick={close}>{svg.app.closeIcon}</a>
        {children}
      </div>
    </div>
  ) : null;
}

export default MyModal;