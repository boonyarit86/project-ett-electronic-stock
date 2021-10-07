import React from "react";
import calculateTime from "../../utils/calculateTime";
import { Avatar } from "@material-ui/core";

import "./Notification.css"

export default function Notification({ notifications }) {

  return (
    <div className="container-notification">
      {/* {notifications.length === 0 && <h3>ไม่มีข้อมูล</h3>} */}
      {notifications.map((item, index) => {
          return (
        <div className="list-notification" key={index}>
          <div className="detail-notification">
            <Avatar alt="" src="/images/profile.png" />
            <div className="profile-detail-notification">
              <p>
                {item.isSysMsg
                  ? "ระบบ"
                  : item.user
                  ? item.user.name
                  : "ไม่พบข้อมูล"}{" "}
                {item.user && <span>({item.user.status})</span>}
              </p>
            </div>
          </div>
          <div className="text-notification">
            <p>{item.post}</p>
            <p>{calculateTime(item.date)}</p>
          </div>
        </div>
          )
      })}
    </div>
  );
}
