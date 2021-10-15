import React from 'react';
import { Button, Modal, Backdrop, Fade, TextField } from "@material-ui/core";
import { VALIDATOR_REQUIRE } from "../../shared/utils/validators";
import { makeStyles } from '@material-ui/core/styles';


// Component
import Input from "../../shared/components/FormElements/Input";

// CSS
import "./ModalAction.css"

// CSS Material UI
const useStyles = makeStyles((theme) => ({
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    textarea: {
        marginBottom: "20px"
    },
    textSpan: {
        color: "red"
    },
    header: {
        margin: "10px 0",
    }
}));

// function แบบฟอร์มกรอกจำนวนอุปกรณ์ที่ต้องการคืนของหน้ารายการคงค้าง
function ModalIncompleteBoard(props) {

    const { inputHandler, formState, handleClosePrompt, handleSubmitPrompt, openPrompt, headerPrompt, setDescription, data } = props;
    const classes = useStyles()


    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className="modal-action"
            open={openPrompt}
            onClose={handleClosePrompt}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={openPrompt}>
                <div className={classes.paper}>
                    <h2 className={classes.header} id="transition-modal-title">{headerPrompt}</h2>
                    <form onSubmit={handleSubmitPrompt}>
                        <div>
                            {/* <p>รหัสอุปกรณ์:  <span>{data.toolCode}</span></p> */}
                            <p>ชนิดอุปกรณ์:  <span>{data.tool.type}</span></p>
                            <p>ประเภทอุปกรณ์:  <span>{data.tool.category === "" ? "ไม่ได้กำหนด" : data.tool.category }</span></p>
                            <p>จำนวนอุปกรณ์คงค้าง:  <span className={classes.textSpan}>{data.insuffTotal}</span></p>
                        </div>
                        <Input id="total" element="input" label="จำนวนอุปกรณ์" type="number" errorText="Please fill data" validators={[VALIDATOR_REQUIRE()]} onInput={inputHandler} required />
                        <TextField
                            id="outlined-multiline-flexible"
                            label="รายละเอียดเพิ่มเติม"
                            multiline
                            rowsMax={4}
                            variant="outlined"
                            fullWidth
                            className={classes.textarea}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <div className="modal-action-btn-group">
                            <Button type="submit" variant="contained" color="primary" disabled={!formState.isValid}>อัพเดต</Button>
                            <Button variant="contained" color="secondary" onClick={handleClosePrompt}>ยกเลิก</Button>
                        </div>
                    </form>
                </div>

            </Fade>
        </Modal>
    )
}

export default ModalIncompleteBoard