import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

// CSS
import "./ModalSubmit.css";

// Component
import { Button, Modal, Backdrop, Fade, TextField } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    textarea: {
        margin: "20px 0px"
    }
}));

// แบบฟอร์ดการยกเลิกการเบิกอุปกรณ์ของหน้าประวัติการเบิกอุปกกรณ์
function ModalSubmit(props) {

    const classes = useStyles();
    const { handleClosePrompt, openPrompt, handleSubmitPrompt, setDescription, item } = props;

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className="modal-submit"
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
                    <h2 id="transition-modal-title">คุณต้องการทำขั้นตอนนี้หรือไม่ ?</h2>
                    <p>ชื่ออุปกรณ์: {item.tool.toolName}</p>
                    <p>จำนวนอุปกรณ์ที่ต้องการคืนไปยังสต๊อก: <span style={{color: "red"}}>{item.total}</span></p>
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
                    <div className="modal-submit-btn-group">
                        <Button variant="contained" color="primary" onClick={handleSubmitPrompt}>ยืนยัน</Button>
                        <Button variant="contained" color="secondary" onClick={handleClosePrompt}>ยกเลิก</Button>
                    </div>
                </div>
            </Fade>
        </Modal>
    )
}

export default ModalSubmit
