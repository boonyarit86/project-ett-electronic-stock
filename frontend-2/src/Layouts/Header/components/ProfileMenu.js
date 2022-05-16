import React, { useState, useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { IoIosArrowDown } from "react-icons/io";
import Avatar from "../../../Components/Avatar/Avatar";
import Backdrop from "../../../Components/Backdrop/Backdrop";
import Profile from "../../../Components/Modal/Profile";
import Skeleton from "../../../Components/Skeleton/Skeleton";
import { AuthContext } from "../../../context/auth-context";
import "./ProfileMenu.css";
import EditProfile from "../../../Components/Modal/EditProfile";

const ProfileMenu = () => {
  const auth = useContext(AuthContext);
  const user = useSelector((state) => state.user.user);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenProfile, setIsOpenProfile] = useState(false);
  const [isOpenEditProfile, setIsOpenEditProfile] = useState(false);

  useEffect(() => {
    if (user?.role === "unapprove" || user?.active === false) {
      auth.logout();
    }
  }, [user]);

  const handleDropdownMenu = () => setIsOpen((prev) => !prev);
  const handleProfileModal = () => {
    if (isOpen) {
      setIsOpen(false);
    }
    setIsOpenProfile((prev) => !prev);
  };
  const handleEditProfileModal = () => {
    if (isOpen) {
      setIsOpen(false);
    }
    if (isOpenProfile) {
      setIsOpenProfile(false);
    }
    setIsOpenEditProfile((prev) => !prev);
  };
  
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
            src={user?.avatar?.url ? user.avatar.url : null}
            shape="circle"
            onClick={handleDropdownMenu}
            alt="user avatar"
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
          <li className="profileMenu__item" onClick={handleProfileModal}>
            โพรไฟล์
          </li>
          <li className="profileMenu__item" onClick={handleEditProfileModal}>
            แก้ไขโพรไฟล์
          </li>
          <li className="profileMenu__item" onClick={() => auth.logout()}>
            ออกจากระบบ
          </li>
        </ul>
      )}
      {isOpen && <Backdrop onClick={handleDropdownMenu} />}
      {isOpenProfile && (
        <Backdrop
          black
          onClick={handleProfileModal}
          style={{ zIndex: "100" }}
        />
      )}
      {isOpenEditProfile && (
        <Backdrop
          black
          onClick={handleEditProfileModal}
          style={{ zIndex: "100" }}
        />
      )}
      {isOpenProfile && (
        <Profile
          onClick={handleProfileModal}
          user={user}
          handleEditProfileModal={handleEditProfileModal}
        />
      )}
      {isOpenEditProfile && (
        <EditProfile onClick={handleEditProfileModal} user={user} />
      )}
    </div>
  );
};

export default ProfileMenu;
