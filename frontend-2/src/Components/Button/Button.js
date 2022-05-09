import React from "react";
import { Link } from "react-router-dom";
import "./Button.css";

const Button = React.memo((props) => {
  const element =
    props.element === "button" ? (
      <button
        type={props.type}
        className={`btn ${props.className}`}
        disabled={props.disabled}
        onClick={props.onClick}
      >
        {props.children}
      </button>
    ) : (
      <Link to={props.path}>
        <button
          type={props.type}
          className={`btn ${props.className}`}
          disabled={props.disabled}
        >
          {props.children}
        </button>
      </Link>
    );
  return <React.Fragment>{element}</React.Fragment>;
});

export default Button;
