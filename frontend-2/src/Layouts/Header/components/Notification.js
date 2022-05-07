import React, { useEffect, useState, useContext } from "react";
import { BsBell } from "react-icons/bs";
import { io } from "socket.io-client";
import Axios from "axios";
import Avatar from "../../../Components/Avatar/Avatar";
import Backdrop from "../../../Components/Backdrop/Backdrop";
import { AuthContext } from "../../../context/auth-context";
import "./Notification.css";

const Notification = () => {
  const auth = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unReadNotifications, setUnReadNotifications] = useState(0);
  // Connect with Socket.io
  useEffect(() => {
    // const socket = io("ws://localhost:5000");
    // const socket = io("https://ett-test.herokuapp.com");
    const socket = io(process.env.REACT_APP_SOCKET_URL);
    socket.on("notification-action", (data) => {
      setUnReadNotifications(data.unreadNotifications);
      setNotifications(data.notifications);
    });

    return () => socket.disconnect();
  }, []);

  const handleNotification = async () => {
    setIsOpen((prev) => !prev);
    if (!isOpen && unReadNotifications !== 0) {
      await Axios.post(`${process.env.REACT_APP_BACKEND_URL}/notifications`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
        .then((res) => setUnReadNotifications(0))
        .catch((error) => {
          console.error(error);
        });
    }
  };

  return (
    <div className="notification">
      <div className="notification__count" style={{right: `${unReadNotifications >= 10 ? '-40%' : '-10%'}`}} onClick={handleNotification}>
        <span className="notification__number">{unReadNotifications}</span>
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
                <Avatar className="icon--large-2" />
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
