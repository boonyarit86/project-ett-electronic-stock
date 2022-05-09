import React, { useReducer, useEffect } from "react";
import "./Select.css";

// Function Input ตัวจับ Error
const Select = (props) => {
  const { state, setState } = props;

  const changeHandler = (e) => {
    setState(e.target.value);
  };

  return (
    <div className={`select ${props.fullWidth && "fullWidth"}`}>
      <label
        htmlFor={props.id}
        className={`select__label`}
      >
        {props.label}{" "}
        {props.required && <span className="input__required">*</span>}
      </label>
      <select
        name={props.name}
        id={props.id}
        className={`select__input`}
        onChange={changeHandler}
        value={state}
        required
      >
        <option value="" className="select__option" disabled>
          --- {props.placeholder} ---
        </option>
        {props.data.length > 0 &&
          props.data.map((item) => (
            <option value={item.value} className="select__option" key={item.value}>
              {item.name}
            </option>
          ))}
      </select>
    </div>
  );
};

export default Select;
