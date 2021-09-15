import React, { useReducer, useEffect } from 'react'
import { TextField } from "@material-ui/core"

import { validate } from '../../utils/validators.js'
// import './Input.css'


// Input of Login page
const inputReducer = (state, action) => {
    switch (action.type) {
        case 'CHANGE':
            return {
                ...state,
                value: action.val,
                isValid: validate(action.val, action.validators)
            };
        case 'TOUCH': {
            return {
                ...state,
                isTouched: true
            }
        }
        default:
            return state;
    }
};

// Function Input ตัวจับ Error
const Input = props => {
    const [inputState, dispatch] = useReducer(inputReducer, {
        value: props.initialValue || '',
        isTouched: false,
        isValid: props.initialValid || false
    });

    const { id, onInput } = props;
    const { value, isValid } = inputState;

    useEffect(() => {
        onInput(id, value, isValid)
    }, [id, value, isValid, onInput]);

    const changeHandler = event => {
        dispatch({
            type: 'CHANGE',
            val: event.target.value,
            validators: props.validators
        });
    };

    const touchHandler = () => {
        dispatch({
            type: 'TOUCH'
        });
    };

    const element =
        props.element === 'input' ? (
            <TextField error={!inputState.isValid && inputState.isTouched}
                id={props.id}
                label={<div>{props.label} <span style={{color: "red", fontWeight: "bold"}}>*</span></div>}
                variant="outlined"
                fullWidth
                type={props.type}
                helperText={!inputState.isValid && inputState.isTouched && props.errorText}
                onChange={changeHandler}
                onBlur={touchHandler}
                value={inputState.value}
                style={{margin: "20px 0"}}
                InputLabelProps={{
                    shrink: props.shrink,
                }}
                disabled={props.disabled}
            />
        ) : (
            <textarea
                id={props.id}
                rows={props.rows || 3}
                onChange={changeHandler}

                onBlur={touchHandler}
                value={inputState.value}
            />
        );

    return (
        <React.Fragment>
            { element }
        </React.Fragment>
    );
};

export default Input;