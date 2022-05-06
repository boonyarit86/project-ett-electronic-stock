import React from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { IoIosCheckmarkCircle } from "react-icons/io";
import "./Toast.css";

const Toast = React.memo((props) => {
    let element; 
    if(props.element === "error") {
        element = (
        <div className={`toast toast__error--${props.type}`}>
            <FiAlertTriangle className="icon--medium" />
            <span className="toast__heading">{props.message}</span>
        </div>
        )
    } else if(props.element === "success") {
        <div className={`toast toast__success--${props.type}`}>
            <IoIosCheckmarkCircle className="icon--medium" />
            <span className="toast__heading">{props.message}</span>
        </div>
    }

    return <React.Fragment>{element}</React.Fragment>
});

export default Toast;