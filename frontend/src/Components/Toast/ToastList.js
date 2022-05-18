import React from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import "./Toast.css";
import "./ToastList.css";

const ToastList = React.memo((props) => {
  let element;
  if (props.element === "error") {
    element = (
      <div className="toast">
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
  }

  return (
    <div
      className={`toastList toast__error--${props.type} ${props.className}`}
      style={props.style}
    >
      {element}
      <ul className="toastList__article">
        {props.article.length > 0 &&
          props.article.map((item) => (
            <li className="toastList__text" key={item.id}>{item.text}</li>
          ))}
      </ul>
    </div>
  );
});

export default ToastList;
