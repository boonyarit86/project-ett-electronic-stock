import React from "react";
import "./Button.css";

const Button = React.memo((props) => {
  const element =
    props.element === "button" ? (
      <button type={props.type} className={`btn ${props.className}`} disabled={props.disabled}>
        {props.children}
      </button>
    ) : (
      <a></a>
    );
  return <React.Fragment>{ element }</React.Fragment>;
});

export default Button;
