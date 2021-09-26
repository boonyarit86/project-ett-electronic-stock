import React, { useReducer, useEffect } from 'react'
import { Select, FormControl, InputLabel, MenuItem } from "@material-ui/core"
import { validate } from "../../utils/validators.js";
import { makeStyles } from '@material-ui/core/styles';

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

const useStyles = makeStyles((theme) => ({
    formControl: {
        width: "100%"
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

// function Select จับ error
const SelectValidation = props => {

    const classes = useStyles();

    const [inputState, dispatch] = useReducer(inputReducer, {
        value: props.initialValue || '',
        isTouched: false,
        isValid: props.initialValid || false
    });

    const { id, onInput, data } = props;
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

    return (
        <FormControl variant="outlined" className={classes.formControl} error={!inputState.isValid && inputState.isTouched}  >
            <InputLabel id={id}><div>{props.filterName} <span style={{color: "red", fontWeight: "bold"}}>*</span></div></InputLabel>
            <Select
                labelId={id}
                id={id}
                value={inputState.value}
                onChange={changeHandler}
                label="ชื่อบอร์ด"
                onBlur={touchHandler}
            >
                {data.map((item) => (
                    <MenuItem key={item._id} value={item._id}>{item.boardName}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default SelectValidation;
