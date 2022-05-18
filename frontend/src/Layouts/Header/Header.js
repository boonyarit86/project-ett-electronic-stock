import React, { useContext } from "react";
import { AiOutlineMenu } from "react-icons/ai";

import Notification from "./components/Notification";
import ProfileMenu from "./components/ProfileMenu";
import { AuthContext } from "../../context/auth-context";
import "./Header.css";

const Header = () => {
  const auth = useContext(AuthContext);

  const handleMenu = () => {
    auth.handleSidebar();
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
