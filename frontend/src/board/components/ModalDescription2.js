import React, { useState } from "react";
import { Modal, Backdrop, Fade } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { time } from "../../shared/utils/Time";

// CSS
import "./ModalDescription2.css";

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
  const sendTagHistoryTool = (index) => {
    setTagIndex(data.tags.length - 1 - index);
  };

  console.log(data.tags);

  const newModal = (
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
          <div className="content-row">
            <div>
              <p>ชื่อบอร์ด</p>
            </div>
            <div>
              <p>{data.board.boardName}</p>
            </div>
          </div>
          <div className="content-row">
            <div>
              <p>ชนิด</p>
            </div>
            <div>
              {/* <p>{data.tool.type}</p> */}
              <p>lorem sfds sdvsv sdvsvvdds vdsvs vdsv</p>
            </div>
          </div>
          <hr />
          {data.tags.map((tag, index) => (
            <div className="tags-box" key={index}>
              <button onClick={() => sendTagHistoryTool(index)} style={{border: index === tagIndex  && "1px solid #34aadc"  }}>
                {index + 1}
              </button>
            </div>
          ))}
          <div className="content-row">
            <div>
              <p>
                {data.actionType === "เบิก" ? "การเบิก" : "การเพิ่ม"}ครั้งที่
              </p>
            </div>
            <div>
              <p>{data.tags.length - tagIndex}</p>
            </div>
          </div>
          <div className="content-row">
            <div>
              <p>เลขที่</p>
            </div>
            <div>
              <p>{data.tags[tagIndex].code}</p>
            </div>
          </div>
          <div className="content-row">
            <div>
              <p>ชื่อผู้ใช้</p>
            </div>
            <div>
              <p>
                {data.tags[tagIndex].user
                  ? `${data.tags[tagIndex].user.name} (${data.tags[tagIndex].user.status})`
                  : "ไม่มีข้อมูล"}
              </p>
            </div>
          </div>
          <div className="content-row">
            <div>
              <p>ดำเนินการ</p>
            </div>
            <div>
              <p>{data.tags[tagIndex].action}</p>
            </div>
          </div>
          {data.actionType === "เบิกอุปกรณ์พร้อมบอร์ด" && (
            <div className="content-row">
              <div>
                <p>ชื่อบอร์ด</p>
              </div>
              <div>
                <p>{data.tags[tagIndex].boardName}</p>
              </div>
            </div>
          )}
          <div className="content-row">
            <div>
              <p>
                จำนวน
              </p>
            </div>
            <div>
              <p>{data.tags[tagIndex].total}</p>
            </div>
          </div>
          <div className="content-row">
            <div>
              <p>วันที่</p>
            </div>
            <div>
              <p>{formatDate(data.tags[tagIndex].date)}</p>
            </div>
          </div>
          <div className="content-row">
            <div>
              <p>คำอธิบาย</p>
            </div>
            <div>
              <p>{data.tags[tagIndex].description}</p>
            </div>
          </div>
          <hr />
          {data.actionType === "เบิกบอร์ดแบบชุด" && (
            <>
            <h4>รายการอุปกรณ์</h4>
            <table className="modal-description-table">
              <thead>
                <tr>
                  <th>ชื่อ</th>
                  <th>จำนวนที่ใช้</th>
                  {data.tags[tagIndex].action !== "คืนสต๊อก" && ( <th>จำนวนค้าง</th> )}
                </tr>
              </thead>
              <tbody>
                {data.tags[tagIndex].tools.map((tool) => (
                  <tr>
                    <th>{tool.tool}</th>
                    <th>{tool.total}</th>
                    {data.tags[tagIndex].action !== "คืนสต๊อก" && ( <th>{tool.insuffTotal}</th> )}
                  </tr>
                )) }
              </tbody>
            </table>
            </>
          )}
        </div>
      </Fade>
    </Modal>
  );
  return <React.Fragment>{newModal}</React.Fragment>;
}

export default ModalDescription;
