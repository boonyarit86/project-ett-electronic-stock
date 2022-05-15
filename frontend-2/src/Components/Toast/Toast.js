import React from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import "./Toast.css";

const Toast = React.memo((props) => {
  let element;
  if (props.element === "error") {
    element = (
      <div
        className={`toast toast__error--${props.type} ${props.className}`}
        style={props.style}
      >
        <FiAlertTriangle className="icon--medium" />
        <span className="toast__heading">{props.message}</span>
      </div>
    );
  } else if (props.element === "success") {
    element = (
      <div
        className={`toast toast__success--${props.type} ${props.className}`}
        style={props.style}
      >
        <IoIosCheckmarkCircleOutline className="icon--medium" />
        <span className="toast__heading">{props.message}</span>
      </div>
    );
  } else if (props.element === "warning") {
    element = (
      <div
        className={`toast toast__warning--${props.type} ${props.className}`}
        style={props.style}
      >
        <FiAlertTriangle className="icon--medium" />
        <span className="toast__heading">{props.message}</span>
      </div>
    );
  }

  return <React.Fragment>{element}</React.Fragment>;
});

export default Toast;
