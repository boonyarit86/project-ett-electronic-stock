import React from "react";
import "./ToastToolList.css";

const ToastToolList = (props) => {
  return (
    <div className={`toastToolList toastToolList--default`}>
      <div className="toastToolList__header">
        <span className="toast__heading toastToolList__heading--default">
          {props.title}
        </span>
      </div>
      <div className="toastToolList__table">
        <div className="toastToolList__row">
          <p style={{fontWeight: 700}}>ชื่อ</p>
          <p style={{fontWeight: 700}}>{props.action.includes("ยกเลิก") ? "จำนวนคืน" : "จำนวนที่ใช้"}</p>
          {!props.action.includes("ยกเลิก") && <p style={{fontWeight: 700}}>จำนวนค้าง</p>}
        </div>
        {props.data.map((item, index) => (
          <div className="toastToolList__row" key={index}>
            <p>{item?.tool?.toolName || "ไม่มีข้อมูล"}</p>
            <p>{item.total}</p>
            {!props.action.includes("ยกเลิก") && (
              <p>{item.insufficientTotal}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToastToolList;
