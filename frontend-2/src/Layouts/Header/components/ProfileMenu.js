import React, { useState, useContext } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import Avatar from "../../../Components/Avatar/Avatar";
import Backdrop from "../../../Components/Backdrop/Backdrop";
import Skeleton from "../../../Components/Skeleton/Skeleton";
import { AuthContext } from "../../../context/auth-context";
import "./ProfileMenu.css";

const ProfileMenu = () => {
  const auth = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const handleDropdownMenu = () => setIsOpen((prev) => !prev);
  const user = useSelector((state) => state.user.user);
  //   console.log("Re-render ProfileMenu component")
  return (
    <div className="profileMenu">
      {!user ? (
        <React.Fragment>
          <Skeleton element="image" width="3.2" height="3.2" shape="circle" />
          <Skeleton
            element="text"
            size="small"
            className="profileMenu__username"
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Avatar
            className="icon--large"
            avatar={user?.avatar?.url ? user.avatar.url : null}
            onClick={handleDropdownMenu}
          />
          <span className="profileMenu__username" onClick={handleDropdownMenu}>
            {user.name}
          </span>
        </React.Fragment>
      )}

      <IoIosArrowDown
        onClick={handleDropdownMenu}
        className={`profileMenu__arrow-icon ${
          isOpen ? "active" : null
        } icon--medium`}
      />
      {isOpen && (
        <ul className="profileMenu__list">
          <li className="profileMenu__item">
            <Link to="/" onClick={handleDropdownMenu}>
              โพรไฟล์
            </Link>
          </li>
          <li className="profileMenu__item">
            <Link to="/" onClick={handleDropdownMenu}>
              แก้ไขโพรไฟล์
            </Link>
          </li>
          <li className="profileMenu__item" onClick={() => auth.logout()}>
            ออกจากระบบ
          </li>
        </ul>
      )}
      {isOpen && <Backdrop onClick={handleDropdownMenu} />}
    </div>
  );
};

export default ProfileMenu;
