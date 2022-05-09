import React, { useReducer, useEffect } from "react";
import { validate } from "../../utils/validators";
import "./Input.css";

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
const Input = (props) => {
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

  const element =
    props.element === "input" ? (
      // <TextField
      //   error={!inputState.isValid && inputState.isTouched}
      //   id={props.id}
      //   label={
      //     <div>
      //       {props.label}{" "}
      //       <span style={{ color: "red", fontWeight: "bold" }}>*</span>
      //     </div>
      //   }
      //   variant="outlined"
      //   fullWidth
      //   type={props.type}
      //   helperText={
      //     !inputState.isValid && inputState.isTouched && props.errorText
      //   }
      //   onChange={changeHandler}
      //   onBlur={touchHandler}
      //   value={inputState.value}
      //   style={{ margin: "20px 0" }}
      //   InputLabelProps={{
      //     shrink: props.shrink,
      //   }}
      //   disabled={props.disabled}
      // />
      <div
        className={`input__box ${props.fullWidth && "fullWidth"} ${
          isInputEmpty(isValid, isTouched, props.errorMessage) &&
          "input__box-error"
        }`}
      >
        <label className="input__label" htmlFor={props.id}>
          {props.label} {props.required && <span className="input__required">*</span>}
        </label>
        <input
          id={props.id}
          type={props.type}
          name={props.id}
          placeholder={props.placeholder}
          required={props.required}
          onBlur={touchHandler}
          onChange={changeHandler}
          value={inputState.value}
        />
        {isInputEmpty(isValid, isTouched, props.errorMessage) ? (
          <span className="input__error-message">{props.errorMessage}</span>
        ) : props.helperText ? (
          <span className="input__helperText">{props.helperText}</span>
        ) : null}
      </div>
    ) : (
      <textarea
        id={props.id}
        rows={props.rows || 3}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
      />
    );

  return <React.Fragment>{element}</React.Fragment>;
};

export default Input;
