import React from "react";
import { AiOutlineMenu } from "react-icons/ai";

import Notification from "./components/Notification";
import ProfileMenu from "./components/ProfileMenu";
import "./Header.css";

const Header = () => {

  //   console.log("Re-render Header section");

  const handleMenu = () => {
    let sideBar = document.getElementById("sidebar");
    sideBar.classList.toggle("open");
  }

  return (
    <header className="header">
      <div className="header__icons">
        <AiOutlineMenu className="header__menu-icon icon--medium" onClick={handleMenu} />
        <img src="./images/logo.svg" alt="logo" />
      </div>
      <div className="header__right-side">
        <Notification />
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Header;
