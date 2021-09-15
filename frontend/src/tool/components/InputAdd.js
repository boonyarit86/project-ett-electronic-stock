import React from "react";
import {
  Paper,
  IconButton,
  InputBase,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

// Icons
import AddBoxIcon from "@material-ui/icons/AddBox";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    margin: "10px 0"
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
}));

function InputAdd({ onSubmit, onChange, state, text }) {
  const classes = useStyles();

  return (
    <Paper component="form" className={classes.root}>
      <InputBase
        className={classes.input}
        placeholder={text}
        inputProps={{ "aria-label": "search google maps" }}
        onChange={onChange}
        value={state}
      />
      <IconButton type="button" className={classes.iconButton} aria-label="" onClick={onSubmit}>
        <AddBoxIcon className={classes.AddIcon} />
      </IconButton>
    </Paper>
  );
}

export default InputAdd;
