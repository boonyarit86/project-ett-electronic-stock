import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

// CSS
import "./ModalSubmit.css";

// Component
import { Button, Modal, Backdrop, Fade } from '@material-ui/core';

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
        margin: "20px 0px"
    },
    btnGroup: {
        marginRight: 10
    }
}));

// Function ของหน้ารายละเอียดอุปกรณ์ เป็นแบบฟอร์มยืนยันการลบข้อมูล
function ModalSubmit(props) {

    const classes = useStyles();
    const { handleClosePrompt, openPrompt, handleSubmitPrompt } = props

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
                    <p>การทำขั้นตอนนี้ข้อมูลที่เกี่ยวข้องจะถูกลบไปด้วย</p>
                    <ul>
                        <li>ประวัติการเบิกและเพิ่มบอร์ด</li>
                        <li>ข้อมูลบอร์ดในหน้าอุปกรณ์ไม่ครบ</li>
                    </ul>
                    <div>
                        <Button variant="contained" color="primary" onClick={handleSubmitPrompt} className={classes.btnGroup}>ยืนยัน</Button>
                        <Button variant="contained" color="secondary" onClick={handleClosePrompt}>ยกเลิก</Button>
                    </div>
                </div>
            </Fade>
        </Modal>
    )
}

export default ModalSubmit
