import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Heading from "../../Components/Text/Heading";
import { AiOutlineTool } from "react-icons/ai";
import { VscCircuitBoard } from "react-icons/vsc";
import "./Dashboard.css";
import EquipmentStatusBoxs from "../../Components/EquipmentStatusBox/EquipmentStatusBoxs";

const Dashboard = () => {
  const boards = useSelector((state) => state.board.boards);
  const tools = useSelector((state) => state.tool.tools);

  const [statusBoxes, setStatusBoxes] = useState([]);

  useEffect(() => {
    if (boards.length !== 0 && tools.length !== 0) {
        let toolOut = tools.filter((item) => item.total === 0);
        let boardOut = boards.filter((item) => item.total === 0);
        let AllItemTotalOut = toolOut.length + boardOut.length;
      let newArr = [
        {
          icon: <AiOutlineTool className="equipment-box__icon icon--large" />,
          text: "จำนวนอุปกรณ์",
          total: tools.length,
        },
        {
          icon: <VscCircuitBoard className="equipment-box__icon icon--large" />,
          text: "จำนวนบอร์ด",
          total: boards.length,
        },
        {
          icon: <AiOutlineTool className="equipment-box__icon icon--large" />,
          text: "จำนวนของหมดทั้งหมด",
          total: AllItemTotalOut,
        },
      ];
      setStatusBoxes(newArr);
    }
  }, [boards, tools]);

  return (
    <div className="dashboard">
      <Heading type="main" text="หน้าหลัก" />
      <EquipmentStatusBoxs data={statusBoxes} />
    </div>
  );
};

export default Dashboard;
