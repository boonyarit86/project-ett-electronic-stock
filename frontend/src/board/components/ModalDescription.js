import React, { useState } from "react";
import { Modal, Backdrop, Fade } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { time } from "../../shared/utils/Time";

// CSS
import "./ModalDescription.css";

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
}));

// function ของหน้าประวัติการเพิ่ม/เบิกอุปกรณ์ เป็นแบบฟอร์ม tag
function ModalDescription(props) {
  const { handleClosePrompt, openPrompt, data } = props;
  const classes = useStyles();
  const [tagIndex, setTagIndex] = useState(0);
  // const [index, setIndex] = useState("")

  // function เกี่ยวกับเวลา
  const [formatDate] = time();

  // function เปลี่ยน tag
  const sendTagHistoryBoard = (index) => {
    setTagIndex(data.tags.length - 1 - index);
  };

  const newModal =
    data.actionType === "เบิก" || data.actionType === "เพิ่ม" ? (
      <Modal
        aria-labelledby={"transition-modal-title"}
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
          <div id="paper" className={classes.paper}>
            <div className="content">
              <div className="head">
                <p>ชื่อบอร์ด</p>
                <p>ชนิดบอร์ด</p>
                <p>{data.actionType === "เบิก" ? "จำนวนเบิก" : "จำนวนเพิ่ม"}</p>
                <p>
                  {data.actionType === "เบิก"
                    ? "หมายเหตุการเบิก"
                    : "หมายเหตุการเพิ่ม"}
                </p>
              </div>
              <div className="detail">
                <p>{data.board.boardName}</p>
                <p>{data.board.type === "" ? "ไม่ได้กำหนด" : data.board.type}</p>
                <p>{data.total}</p>
                <p>{data.description}</p>
              </div>
            </div>
            <div className="tagHistory">
              <div className="tag">
                <p>
                  {data.actionType === "เบิก" ? "การเบิก" : "การเพิ่ม"}ครั้งที่
                </p>
                <p>เลขที่</p>
                <p>ชื่อผู้ใช้</p>
                <p>สถานะ</p>
                <p>ดำเนินการ</p>
                <p>
                  {data.tags[tagIndex].action === "คืนสต๊อก"
                    ? "จำนวนที่คืน"
                    : data.actionType === "เบิก"
                    ? "จำนวนเบิก"
                    : "จำนวนเพิ่ม"}
                </p>
                <p>วันที่</p>
                <p>คำอธิบาย</p>
              </div>
              <div className="tagDetail">
                <p>{data.tags.length - tagIndex}</p>
                <p>{data.tags[tagIndex].code}</p>
                <p>{data.tags[tagIndex].user.name}</p>
                <p>{data.tags[tagIndex].user.status}</p>
                <p>{data.tags[tagIndex].action}</p>
                <p>{data.tags[tagIndex].total}</p>
                <p>{formatDate(data.tags[tagIndex].date)}</p>
                <p>{data.tags[tagIndex].description}</p>
              </div>
            </div>
            <div className="tagButton">
              {data.tags.map((tag, index) => (
                <div key={index}>
                  <button onClick={() => sendTagHistoryBoard(index)}>
                    {index + 1}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Fade>
      </Modal>
    ) : (
      <div></div>
    );

  return <React.Fragment>{newModal}</React.Fragment>;
}

export default ModalDescription;
