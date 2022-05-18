import React, { useReducer, useEffect } from "react";
import { validate } from "../../utils/validators";
import "./Select.css";

// Input of Login page
const inputReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE":
      return {
        ...state,
        value: action.val,
        isValid: validate(action.val, action.validators),
      };
    case "TOUCH": {
      return {
        ...state,
        isTouched: true,
      };
    }
    default:
      return state;
  }
};

const isInputEmpty = (isValid, isTouched, errorMessage) => {
  return Boolean(!isValid && isTouched && errorMessage);
};

// Function Input ตัวจับ Error
const Select = (props) => {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue || "",
    isTouched: false,
    isValid: props.initialValid || false,
  });

  const { id, onInput } = props;
  const { value, isValid, isTouched } = inputState;

  useEffect(() => {
    onInput(id, value, isValid);
  }, [id, value, isValid, onInput]);

  const changeHandler = (event) => {
    dispatch({
      type: "CHANGE",
      val: event.target.value,
      validators: props.validators,
    });
  };

  const touchHandler = () => {
    dispatch({
      type: "TOUCH",
    });
  };

  return (
    <div className={`select ${props.fullWidth && "fullWidth"}`}>
      <label
        htmlFor={props.id}
        className={`select__label ${
          isInputEmpty(isValid, isTouched, props.errorMessage) &&
          "select__error-label"
        }`}
      >
        {props.label}{" "}
        {props.required && <span className="input__required">*</span>}
      </label>
      <select
        name={props.name}
        id={props.id}
        className={`select__input ${
          isInputEmpty(isValid, isTouched, props.errorMessage) &&
          "select__error"
        }`}
        onBlur={touchHandler}
        onChange={changeHandler}
        value={inputState.value}
        required={props.required}
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
      {isInputEmpty(isValid, isTouched, props.errorMessage) && (
        <span className="input__error-message">{props.errorMessage}</span>
      )}
    </div>
  );
};

export default Select;
