import React from "react";
import {
  Paper,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

// Icons
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";

const useStyles = makeStyles((theme) => ({
  demo: {
    backgroundColor: theme.palette.background.paper,
    margin: "20px 0"
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
  listItem: {
    border: "1px solid #ccc"
  }
}));

function CategoryLists({ onSubmit, onChange, state, handleDelete, handleModal }) {
  const classes = useStyles();

  return (
    <React.Fragment>
      {state.length > 0 ? (
        <div className={classes.demo}>
          <List dense={false}>
            {state.map((item) => {
              return (
                <ListItem key={item._id} className={classes.listItem}>
                  <ListItemText
                    primary={item.category}
                    secondary={false ? "Secondary text" : null}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleModal(item.category, item._id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(item._id)} >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </div>
      ) : null}
    </React.Fragment>
  );
}

export default CategoryLists;
