import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AiOutlineHome,
  AiOutlineTool,
  AiOutlineAppstore,
  AiOutlineClockCircle,
  AiOutlineMenu,
} from "react-icons/ai";
import { VscCircuitBoard } from "react-icons/vsc";
import { FiUsers } from "react-icons/fi";
import { GoSettings } from "react-icons/go";
import Backdrop from "../../Components/Backdrop/Backdrop";
import { AuthContext } from "../../context/auth-context";
import "./Sidebar.css";

const Sidebar = () => {
  const auth = useContext(AuthContext);

  useEffect(() => {
    window.addEventListener("resize", function() {
      if(window.innerWidth >= 900) {
        auth.handleCloseSidebar();
      }
    })
  }, [])

  const onClick = (id) => {
    let menu = document.querySelectorAll(".sidebar__item");
    let newItemActive = document.getElementById(id);

    menu.forEach((item) => {
      let isItemActive = item.getAttribute("class").includes("active");
      if (isItemActive) {
        item.classList.remove("active");
      }
    });

    newItemActive.classList.add("active");
    auth.handleCloseSidebar();
  };

  return (
    <React.Fragment>
      <aside className="sidebar" id="sidebar">
      <div className="sidebar__header">
        <AiOutlineMenu className="sidebar__header-icon icon--medium" onClick={() => auth.handleCloseSidebar()} />
        <img src="./images/logo.svg" alt="logo" />
      </div>
        <ul className="sidebar__list">
          <li
            className="sidebar__item active"
            id="m1"
            onClick={() => onClick("m1")}
          >
            <Link to="/" className="sidebar__link">
              <AiOutlineHome className="sidebar__icon icon--medium" />
              <p className="sidebar__text">หน้าหลัก</p>
            </Link>
          </li>
          <li className="sidebar__item" id="m2" onClick={() => onClick("m2")}>
            <Link to="/toolList" className="sidebar__link">
              <AiOutlineTool className="sidebar__icon icon--medium" />
              <p className="sidebar__text">รายการอุปกรณ์</p>
            </Link>
          </li>
          <li className="sidebar__item" id="m3" onClick={() => onClick("m3")}>
            <Link to="/createTool" className="sidebar__link">
              <AiOutlineAppstore className="sidebar__icon icon--medium" />
              <p className="sidebar__text">สร้างรายการอุปกรณ์</p>
            </Link>
          </li>
          <li className="sidebar__item" id="m4" onClick={() => onClick("m4")}>
            <Link to="/tool/history" className="sidebar__link">
              <AiOutlineClockCircle className="sidebar__icon icon--medium" />
              <p className="sidebar__text">ประวัติรายการอุปกรณ์</p>
            </Link>
          </li>
          <hr className="sidebar__line" />
          <li className="sidebar__item" id="m5" onClick={() => onClick("m5")}>
            <Link to="/boardList" className="sidebar__link">
              <VscCircuitBoard className="sidebar__icon icon--medium" />
              <p className="sidebar__text">รายการบอร์ด</p>
            </Link>
          </li>
          <li className="sidebar__item" id="m6" onClick={() => onClick("m6")}>
            <Link to="/createBoard" className="sidebar__link">
              <AiOutlineAppstore className="sidebar__icon icon--medium" />
              <p className="sidebar__text">สร้างรายการบอร์ด</p>
            </Link>
          </li>
          <li className="sidebar__item" id="m7" onClick={() => onClick("m7")}>
            <Link to="/requestBoard" className="sidebar__link">
              <VscCircuitBoard className="sidebar__icon icon--medium" />
              <p className="sidebar__text">เบิกบอร์ดและอุปกรณ์</p>
            </Link>
          </li>
          <li className="sidebar__item" id="m8" onClick={() => onClick("m8")}>
            <Link to="/board/history" className="sidebar__link">
              <AiOutlineClockCircle className="sidebar__icon icon--medium" />
              <p className="sidebar__text">ประวัติรายการบอร์ด</p>
            </Link>
          </li>
          <hr className="sidebar__line" />
          <li className="sidebar__item" id="m9" onClick={() => onClick("m9")}>
            <Link to="/insTool" className="sidebar__link">
              <AiOutlineTool className="sidebar__icon icon--medium" />
              <p className="sidebar__text">รายการอุปกรณ์ไม่พอ</p>
            </Link>
          </li>
          <li className="sidebar__item" id="m10" onClick={() => onClick("m10")}>
            <Link to="/authUser" className="sidebar__link">
              <FiUsers className="sidebar__icon icon--medium" />
              <p className="sidebar__text">การจัดการผู้ใช้งาน</p>
            </Link>
          </li>
          <li className="sidebar__item" id="m11" onClick={() => onClick("m11")}>
            <Link to="/" className="sidebar__link">
              <GoSettings className="sidebar__icon icon--medium" />
              <p className="sidebar__text">ตั้งค่าชนิด/ประเภทอุปกรณ์</p>
            </Link>
          </li>
        </ul>
      </aside>
      {auth.isSidebarOpen && ( <Backdrop black style={{zIndex: 1}} onClick={() => auth.handleSidebar()} />) }
    </React.Fragment>
  );
};

export default Sidebar;
