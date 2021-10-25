import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

// Icons
// import AddBoxIcon from "@material-ui/icons/AddBox";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  AddIcon: {
    color: "blue",
    fontSize: "28px",
  },
  margin: {
    margin: "10px 0",
  },
}));

function SelectCategory({ data, onChange, value }) {
  const classes = useStyles();

  

  return (
    <FormControl
      variant="outlined"
      className={classes.margin}
      style={{ width: "100%" }}
    >
      <InputLabel id="demo-simple-select-outlined-label">{"ประเภท"}</InputLabel>
      <Select
        labelId="demo-simple-select-outlined-label"
        id="demo-simple-select-outlined"
        value={value}
        onChange={onChange}
        label="ประเภทอุปกรณ์"
        fullWidth
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {data
          ? data.categorys.map((item) => (
              <MenuItem key={item._id} value={item}>
                {item.category}
              </MenuItem>
            ))
          : null}
      </Select>
    </FormControl>
  );
}

export default SelectCategory;
