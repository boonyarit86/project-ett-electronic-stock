import React from "react";
import Title from "../Text/Title";

// componet นี้จะแสดงใต้ตารางของประวัติการเบิก/เพิ่ม
const DescriptionHistory = React.memo(() => {
  return (
    <div className="history-des">
      <Title>รายละเอียดเพิ่มเติม</Title>
      <p style={{ color: "#e03131" }}>
        ค่าตัวเลขติดลบ หมายถึง การเบิกของลงสต๊อก
      </p>
      <p style={{ color: "#2f9e44" }}>
        ค่าตัวเลขบวก หมายถึง การเพิ่มของลงสต๊อก
      </p>
    </div>
  );
});

export default DescriptionHistory;
