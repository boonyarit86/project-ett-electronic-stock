import React from "react";
import {
  Paper,
  IconButton,
  InputBase,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

// Icons
import DeleteIcon from "@material-ui/icons/Delete";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    margin: "10px 0 20px 0"
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  AddIcon: {
    color: "red",
    fontSize: "28px",
  },
}));

function TypeDelete({ onClick, state }) {
  const classes = useStyles();

  return (
    <Paper component="form" className={classes.root}>
      <div
        className={classes.input}
      >
        <p>Categorys of {state.type}</p>
      </div>
      <IconButton type="button" className={classes.iconButton} aria-label="" onClick={onClick}>
        <DeleteIcon className={classes.AddIcon} />
      </IconButton>
    </Paper>
  );
}

export default TypeDelete;
