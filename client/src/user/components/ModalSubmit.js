import React from 'react';
import { makeStyles } from '@material-ui/core/styles';


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
    marginBtn: {
        marginRight: "5px"
    }
}));

// function นี้เป็นแบบฟอร์มการยืนยันทำรายการของหน้าการจัดการเข้าถึงของผู้ใช้
function ModalSubmit(props) {

    const classes = useStyles()
    const { handleClosePrompt, openPrompt, handleSubmitPrompt } = props;

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
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
                    <div className="TableHistoryTool-action">
                        <Button variant="contained" color="primary" className={classes.marginBtn} onClick={handleSubmitPrompt}>ยืนยัน</Button>
                        <Button variant="contained" color="secondary" onClick={handleClosePrompt}>ยกเลิก</Button>
                    </div>
                </div>
            </Fade>
        </Modal>
    )
}

export default ModalSubmit
