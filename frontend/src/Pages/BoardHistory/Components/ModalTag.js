import React from "react";
import Backdrop from "../../../Components/Backdrop/Backdrop";
import ModalHistory from "../../../Components/Modal/ModalHistory";
import ToastToolList from "./ToastToolList";
import { time } from "../../../utils/Time";

const ModalTag = (props) => {
  let currentTag = props.tags[props.currentTag];
  let board = props.board;
  const [formatDate] = time();

  let element;
  if (
    currentTag.action === "เบิกบอร์ด" ||
    currentTag.action === "เพิ่มบอร์ด" ||
    currentTag.action === "ยกเลิกการเพิ่ม" ||
    currentTag.action === "ยกเลิกการเบิก"
  ) {
    element = null
  } else if (
    currentTag.action === "เบิกบอร์ดพร้อมกับอุปกรณ์" ||
    currentTag.action.includes("อุปกรณ์ไม่ครบ") || currentTag.action === "ยกเลิกเบิกบอร์ดพร้อมกับอุปกรณ์"
  ) {
    element = (
      <ToastToolList data={currentTag.tools} title="รายการอุปกรณ์ที่ใช้ทั้งหมด" action={currentTag.action} />
    );
  }

  return (
    <React.Fragment>
      <ModalHistory
        tags={props.tags}
        handleCurrentTag={props.handleCurrentTag}
        onClick={props.handleCloseTag}
      >
        <article className="modalHistory__article">
          <div className="modalHistory__article-row">
            <p className="modalHistory__title">ชื่อบอร์ด</p>
            <p className="modalHistory__text">{board.boardName}</p>
          </div>
          <div className="modalHistory__article-row">
            <p className="modalHistory__title">เลขที่</p>
            <p className="modalHistory__text">
              {board.code}-{props.currentTag + 1}
            </p>
          </div>
          <div className="modalHistory__article-row">
            <p className="modalHistory__title">ชื่อผู้ใช้งาน</p>
            <p className="modalHistory__text">
              {currentTag?.creator?.name
                ? currentTag.creator.name
                : "ไม่มีข้อมูล"}
            </p>
          </div>
          <div className="modalHistory__article-row">
            <p className="modalHistory__title">ประเภทการดำเนินการ</p>
            <p className="modalHistory__text">{currentTag.action}</p>
          </div>
          <div className="modalHistory__article-row">
            <p className="modalHistory__title">จำนวน</p>
            <p className="modalHistory__text">{currentTag.total}</p>
          </div>
          <div className="modalHistory__article-row">
            <p className="modalHistory__title">วันที่</p>
            <p className="modalHistory__text">
              {formatDate(currentTag.createAt)}
            </p>
          </div>
          <div className="modalHistory__article-row">
            <p className="modalHistory__title">หมายเหตุ</p>
            <p className="modalHistory__text">{currentTag.description}</p>
          </div>
        </article>
        {element}
      </ModalHistory>
      <Backdrop black onClick={props.handleCloseTag} style={{ zIndex: 100 }} />
    </React.Fragment>
  );
};

export default ModalTag;
