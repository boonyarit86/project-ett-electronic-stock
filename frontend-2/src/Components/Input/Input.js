import React, { useEffect } from "react";
import "./Input.css";

// Function Input ตัวจับ Error
const Input = (props) => {
  const { state, setState, initialValue } = props;

  useEffect(() => {
    if(initialValue) {
      setState(initialValue);
    }
  }, [initialValue])

  const changeHandler = (e) => {
    setState(e.target.value);
  };

  const element =
    props.element === "input" ? (
      <div className={`input__box ${props.fullWidth && "fullWidth"}`}>
        <label className="input__label" htmlFor={props.id}>
          {props.label}{" "}
          {props.required && <span className="input__required">*</span>}
        </label>
        <input
          id={props.id}
          type={props.type}
          name={props.id}
          placeholder={props.placeholder}
          required={props.required}
          onChange={changeHandler}
          value={state}
        />
        {props.helperText ? (
          <span className="input__helperText">{props.helperText}</span>
        ) : null}
      </div>
    ) : (
      <div className={`input__box ${props.fullWidth && "fullWidth"}`}>
        <label className="input__label" htmlFor={props.id}>
          {props.label}{" "}
          {props.required && <span className="input__required">*</span>}
        </label>
        <textarea
          id={props.id}
          rows={props.rows || 3}
          onChange={changeHandler}
          value={state}
        />
      </div>
    );

  return <React.Fragment>{element}</React.Fragment>;
};

export default Input;
