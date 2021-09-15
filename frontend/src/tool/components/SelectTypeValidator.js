import React, { useEffect, useReducer } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { validate } from "../../shared/utils/validators";

// Component
import { FormControl, Select, InputLabel, MenuItem } from "@material-ui/core";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  formControl: {
    width: "100%",
    margin: "10px 0",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const inputReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE":
      return {
        ...state,
        value: action.val,
        isValid: action.val.type ? true : false,
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

// Function ชนิดอุปกรณ์ของหน้าสร้างอุปกรณ์และหน้าแก้ไขอุปกรณ์
function SelectTypeValidator(props) {
  const classes = useStyles();

  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue || false,
    isTouched: false,
    isValid: props.initialValid || false,
  });

  const { id, onInput, data, filterName } = props;
  const { value, isValid } = inputState;

  useEffect(() => {
    onInput(id, value, isValid);
  }, [id, value, isValid, onInput]);

  const changeHandler = (event) => {
    dispatch({
      type: "CHANGE",
      val: event.target.value,
      // validators: props.validators,
    });
  };

  const touchHandler = () => {
    dispatch({
      type: "TOUCH",
    });
  };

  return (
    <FormControl
      variant="outlined"
      className={classes.formControl}
      error={!inputState.isValid && inputState.isTouched}
    >
      <InputLabel id={id}>
        <div>
          {filterName}{" "}
          <span style={{ color: "red", fontWeight: "bold" }}>*</span>
        </div>
      </InputLabel>
      <Select
        labelId={id}
        id={id}
        value={inputState.value}
        onChange={changeHandler}
        label="ชนิด"
        onBlur={touchHandler}
        fullWidth
      >
        {/* <MenuItem value={{}}>
          <em>None</em>
        </MenuItem> */}
        {data.map((item) => (
          <MenuItem key={item._id} value={item}>
            {item.type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
//   return (
//     <FormControl
//       variant="outlined"
//       className={classes.margin}
//       style={{ width: "100%" }}
//     >
//       <InputLabel id="demo-simple-select-outlined-label">
//         {"ประเภท"}
//       </InputLabel>
//       <Select
//         labelId="demo-simple-select-outlined-label"
//         id="demo-simple-select-outlined"
//         // value={state.type || ""}
//         // onChange={onChange}
//         label="ประเภทอุปกรณ์"
//         fullWidth
//       >
//         <MenuItem value={{}}>
//           <em>None</em>
//         </MenuItem>
//         {data ? data.categorys.map((item) => (
//           <MenuItem key={item._id} value={item._id}>
//             {item.category}
//           </MenuItem>
//         )): null}
//       </Select>
//     </FormControl>
//   );
}

export default SelectTypeValidator;
