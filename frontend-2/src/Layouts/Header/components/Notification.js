import React, { useState, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BsBell } from "react-icons/bs";
import Axios from "axios";
import Avatar from "../../../Components/Avatar/Avatar";
import Backdrop from "../../../Components/Backdrop/Backdrop";
import { AuthContext } from "../../../context/auth-context";
import { readNotification } from "../../../Redux/features/notificationSlice";
import "./Notification.css";

const Notification = () => {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const { notifications, unreadNotifications } = useSelector((state) => state.notification);
  const [isOpen, setIsOpen] = useState(false);

  const handleNotification = async () => {
    setIsOpen((prev) => !prev);
    if (!isOpen && unreadNotifications !== 0) {
      await Axios.post(`${process.env.REACT_APP_BACKEND_URL}/notifications`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
        .then((res) => dispatch(readNotification()))
        .catch((error) => {
          console.error(error);
        });
    }
  };

  return (
    <div className="notification">
      <div className="notification__count" style={{right: `${unreadNotifications >= 10 ? '-40%' : '-10%'}`}} onClick={handleNotification}>
        <span className="notification__number">{unreadNotifications}</span>
      </div>
      <BsBell
        className="notification__bell-icon icon--medium"
        onClick={handleNotification}
      />

      {isOpen && (
        <ul className="notification__list">
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <li className="notification__item" key={item._id}>
                <Avatar className="icon--large-2" shape="circle" alt="system avatar" />
                <article>
                  <p className="notification__message">ระบบ: {item.message}</p>
                  <span className="notification__time">ล่าสุด</span>
                </article>
              </li>
            ))
          ) : (
            <li className="notification__item">
              <Avatar className="icon--large-2" />
              <article>
                <p className="notification__message">ระบบ: ไม่มีการแจ้งเตือน</p>
              </article>
            </li>
          )}
        </ul>
      )}
      {isOpen && <Backdrop onClick={handleNotification} />}
    </div>
  );
};

export default Notification;
