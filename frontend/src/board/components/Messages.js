import React from "react";

import "./Messages.css";

export default function Messages({ msgs }) {
  return (
    <div>
      {msgs.error.tools.length !== 0 && (
        <>
          <h3>รายการอุปกรณ์ที่ไม่ครบ</h3>
          <div className="box-table-error">
            <table className="table-msg">
              <thead>
                <tr className="tr-msg">
                  <th>ชื่อ</th>
                  <th>จำนวนที่ต้องใช้</th>
                  <th>จำนวนที่ขาด</th>
                </tr>
              </thead>
              <tbody>
                {msgs.error.tools.map((item) => (
                  <tr key={item.toolName} className="tr-msg">
                    <td>{item.toolName}</td>
                    <td>{item.usedTool}</td>
                    <td>{item.insuffTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {msgs.success.tools.length !== 0 && (
        <>
          <h3>รายการที่สามารถเบิกได้</h3>
          <div className="box-table-success">
            <table className="table-msg">
              <thead>
                <tr className="tr-msg">
                  <th>ชื่อ</th>
                  <th>จำนวนที่ต้องใช้</th>
                  <th>จำนวนที่เหลือ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>บอร์ด {msgs.success.board.boardName}</td>
                  <td>{msgs.success.board.usedBoard}</td>
                  <td>{msgs.success.board.boardInStock}</td>
                </tr>
                {msgs.success.tools.map((item) => (
                  <tr key={item.toolName} className="tr-msg">
                    <td>{item.toolName}</td>
                    <td>{item.usedTool}</td>
                    <td>{item.toolInStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
