import React from "react";
import { makeStyles } from "@material-ui/core/styles";

// Component
import { Button, Modal, Backdrop, Fade, TextField } from "@material-ui/core";

// CSS
import "./ModalAction.css";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  Input: {
    margin: "10px 0 20px 0",
  },
  header: {
    margin: "10px 0",
  },
}));

function ModalEditCategory({
  onSubmit,
  handleCloseModal,
  openModal,
  value,
  onChange
}) {

  const classes = useStyles();

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className="modal-action"
      open={openModal}
      onClose={handleCloseModal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={openModal}>
        <div className={classes.paper}>
          <h2 className={classes.header} id="transition-modal-title">
            แก้ไขชื่อประเภท
          </h2>
            <TextField
              label="ประเภท"
              variant="outlined"
              fullWidth
              type="text"
              onChange={onChange}
              value={value}
              className={classes.Input}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <div className="modal-action-btn-group">
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={onSubmit}
              >
                ยืนยัน
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCloseModal}
              >
                ยกเลิก
              </Button>
            </div>
        </div>
      </Fade>
    </Modal>
  );
}

export default ModalEditCategory;
