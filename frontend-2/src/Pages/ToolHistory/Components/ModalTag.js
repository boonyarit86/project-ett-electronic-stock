import React from "react";
import ModalHistory from "../../../Components/Modal/ModalHistory";
import Backdrop from "../../../Components/Backdrop/Backdrop";
import { time } from "../../../utils/Time";

const ModalTag = (props) => {
  let currentTag = props.tags[props.currentTag];
  let tool = props.tool;
  const [formatDate] = time();

  let element;
  if (
    currentTag.action === "เบิกอุปกรณ์" ||
    currentTag.action === "เพิ่มอุปกรณ์" ||
    currentTag.action === "ยกเลิกการเพิ่ม" ||
    currentTag.action === "ยกเลิกการเบิก"
  ) {
    element = (
      <React.Fragment>
        <div className="modalHistory__article-row">
          <p className="modalHistory__title">จำนวน</p>
          <p className="modalHistory__text">{currentTag.total}</p>
        </div>
      </React.Fragment>
    );
  } else if (currentTag.action === "เบิกบอร์ดพร้อมกับอุปกรณ์" || currentTag.action.includes("อุปกรณ์ไม่ครบ")) {
    element = (
      <React.Fragment>
        <div className="modalHistory__article-row">
          <p className="modalHistory__title">ชื่อบอร์ด</p>
          <p className="modalHistory__text">{currentTag?.board?.boardName ? currentTag.board.boardName : "ไม่มีข้อมูล"}</p>
        </div>
        <div className="modalHistory__article-row">
          <p className="modalHistory__title">เลขที่การเบิกบอร์ด</p>
          <p className="modalHistory__text">{currentTag.bhCode}</p>
        </div>
        <div className="modalHistory__article-row">
          <p className="modalHistory__title">จำนวนเบิกล่าสุด</p>
          <p className="modalHistory__text">{currentTag.total}</p>
        </div>
        <div className="modalHistory__article-row">
          <p className="modalHistory__title">จำนวนเบิกทั้งหมด</p>
          <p className="modalHistory__text">{currentTag.allToolTotalUsed}</p>
        </div>
        <div className="modalHistory__article-row">
          <p className="modalHistory__title">จำนวนอุปกรณ์ไม่ครบ</p>
          <p className="modalHistory__text">{currentTag.insufficientTotal}</p>
        </div>
      </React.Fragment>
    );
  } else if (currentTag.action === "ยกเลิกเบิกบอร์ดพร้อมกับอุปกรณ์") {
    element = (
      <React.Fragment>
        <div className="modalHistory__article-row">
          <p className="modalHistory__title">ชื่อบอร์ด</p>
          <p className="modalHistory__text">{currentTag?.board?.boardName ? currentTag.board.boardName : "ไม่มีข้อมูล"}</p>
        </div>
        <div className="modalHistory__article-row">
          <p className="modalHistory__title">เลขที่การเบิกบอร์ด</p>
          <p className="modalHistory__text">{currentTag.bhCode}</p>
        </div>
        <div className="modalHistory__article-row">
          <p className="modalHistory__title">จำนวนคืนทั้งหมด</p>
          <p className="modalHistory__text">{currentTag.allToolTotalUsed}</p>
        </div>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <ModalHistory tags={props.tags} handleCurrentTag={props.handleCurrentTag} onClick={props.handleCloseTag}>
        <article className="modalHistory__article">
          <div className="modalHistory__article-row">
            <p className="modalHistory__title">ชื่ออุปกรณ์</p>
            <p className="modalHistory__text">{tool.toolName}</p>
          </div>
          <div className="modalHistory__article-row">
            <p className="modalHistory__title">เลขที่</p>
            <p className="modalHistory__text">
              {tool.code}-{props.currentTag + 1}
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
          {element}
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
      </ModalHistory>
      <Backdrop black onClick={props.handleCloseTag} style={{ zIndex: 100 }} />
    </React.Fragment>
  );
};

export default ModalTag;
