import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { VALIDATOR_REQUIRE } from "../../shared/utils/validators";

// Component
import { Button, Modal, Backdrop, Fade, TextField } from "@material-ui/core";
import Input from "../../shared/components/FormElements/Input";

// CSS
import "./ModalAction.css";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    textarea: {
        margin: "10px 0"
    },
    textSpan: {
        color: "red"
    },
    header: {
        margin: "10px 0",
    }
}));

// Function การยืนยันเบิก/เพิ่มอุปกรณ์ลงสต๊อกของหน้ารายการอุปกรณ์
function ModalAction(props) {

    const { onSubmitActions, inputHandler, formState, handleCloseModal,
        openModal, headerForm, description, setDescription,
        data } = props;
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
                    <h2 className={classes.header} id="transition-modal-title">{headerForm}</h2>
                    <form onSubmit={onSubmitActions}>
                        <div>
                            <p>รหัสอุปกรณ์:  <span>{data.toolCode}</span></p>
                            <p>ชนิดอุปกรณ์:  <span>{data.type}</span></p>
                            <p>ประเภทอุปกรณ์:  <span>{data.category}</span></p>
                            <p>ขนาดอุปกรณ์:  <span>{data.size}</span></p>
                            <p>จำนวนอุปกรณ์ในสต๊อก:  <span className={classes.textSpan}>{data.total}</span></p>
                        </div>
                        <Input
                            id="total"
                            element="input"
                            type="number"
                            label="จำนวน"
                            validators={[VALIDATOR_REQUIRE()]}
                            errorText="Please enter a valid Total."
                            onInput={inputHandler}
                            required
                        />
                        <TextField
                            id="outlined-multiline-flexible"
                            label="รายละเอียดเพิ่มเติม"
                            multiline
                            rowsMax={4}
                            variant="outlined"
                            fullWidth
                            className={classes.textarea}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <div className="modal-action-btn-group">
                            <Button type="submit" variant="contained" color="primary" disabled={!formState.isValid} >ยืนยัน</Button>
                            <Button variant="contained" color="secondary" onClick={handleCloseModal}>ยกเลิก</Button>
                        </div>
                    </form>
                </div>
            </Fade>
        </Modal>
    )
}

export default ModalAction
