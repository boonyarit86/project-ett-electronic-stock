import React from 'react'

// CSS
import "./DescriptionHistory.css"

// componet นี้จะแสดงใต้ตารางของประวัติการเบิก/เพิ่ม
function DescriptionHistory() {
    return (
        <div className="history-des">
            <h4>รายละเอียดเพิ่มเติม</h4>
            <p>ค่าตัวเลขติดลบ หมายถึง การเบิกของลงสต๊อก</p>
            <p>ค่าตัวเลขบวก หมายถึง การเพิ่มของลงสต๊อก</p>
        </div>
    )
}

export default DescriptionHistory
