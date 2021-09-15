import React, { useState } from "react";
import { Paper, IconButton, InputBase, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

// Icons
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";


const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    margin: "10px 0 20px 0",
    border: "1px solid blue"
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
  CheckIcon: {
    color: "green",
    fontSize: "28px",
  },
}));

function TypeDelete({ onClick, onChangeEdit, state, newState, onSubmitEdit }) {
  const classes = useStyles();
  const [switchMode, setSwitchMode] = useState(false);

  const handleSwitchMode = () => {
    onSubmitEdit();
    setSwitchMode(false);
  }

  if (switchMode) {
    return (
      <Paper component="form" className={classes.root}>
        <InputBase
          className={classes.input}
          placeholder={`แก้ไขชื่อ ${state.type}`}
          inputProps={{ "aria-label": "search google maps" }}
          onChange={onChangeEdit}
          value={newState}
        />
        <IconButton
          type="button"
          className={classes.iconButton}
          aria-label=""
          onClick={handleSwitchMode}
        >
          <CheckIcon className={classes.CheckIcon} />
        </IconButton>
        <IconButton
          type="button"
          className={classes.iconButton}
          aria-label=""
          onClick={() => setSwitchMode(false)}
        >
          <CloseIcon className={classes.AddIcon} />
        </IconButton>
      </Paper>
    );
  }

  return (
    <Paper component="form" className={classes.root}>
      <div className={classes.input}>
        <p>Categorys of {state.type}</p>
      </div>
      <IconButton
        type="button"
        className={classes.iconButton}
        aria-label=""
        onClick={() => setSwitchMode(true)}
      >
        <EditIcon />
      </IconButton>
      <IconButton
        type="button"
        className={classes.iconButton}
        aria-label=""
        onClick={onClick}
      >
        <DeleteIcon className={classes.AddIcon} />
      </IconButton>
    </Paper>
  );
}

export default TypeDelete;
