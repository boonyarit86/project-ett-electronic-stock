import Notification from "./components/Notification";
import ProfileMenu from "./components/ProfileMenu";
import "./Header.css";

const Header = () => {
  //   console.log("Re-render Header section");
  return (
    <header className="header">
      <img src="./images/logo.svg" alt="logo" />
      <div className="header__right-side">
        <Notification />
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Header;
