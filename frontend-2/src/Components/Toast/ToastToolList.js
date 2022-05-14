import React from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import "./ToastToolList.css";

const ToastToolList = (props) => {
  let element;

  if (props.element === "error") {
    element = (
        <div className="toastToolList__header">
          <FiAlertTriangle className="icon--medium" />
          <span className="toast__heading">{props.title}</span>
        </div>
    );
  } else if(props.element === "success") {
    element = (
        <div className="toastToolList__header">
          <IoIosCheckmarkCircleOutline className="icon--medium" />
          <span className="toast__heading">{props.title}</span>
        </div>
    );
  }

  return (
      <div className={`toastToolList toastToolList--${props.element}`}>
          {element}
          <div className="toastToolList__table">
              <div className="toastToolList__row">
                  <p>ชื่อ</p>
                  <p>จำนวนที่ใช้</p>
                  <p>{props.element === "error" ? "จำนวนที่ขาด" : props.element === "success" ? "จำนวนที่เหลือ" : "จำนวนค้าง"}</p>
              </div>
              {props.data.map((item, index) => (
                  <div className="toastToolList__row" key={index}>
                  <p>{item.toolName}</p>
                  <p>{item.total}</p>
                  <p>{item.toolCalc}</p>
              </div>
              ))}
          </div>
      </div>
  )
};

export default ToastToolList;
