import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Heading from "../../Components/Text/Heading";
import { AiOutlineTool } from "react-icons/ai";
import { VscCircuitBoard } from "react-icons/vsc";
import "./Dashboard.css";
import EquipmentStatusBoxs from "../../Components/EquipmentStatusBox/EquipmentStatusBoxs";
import ToolTable from "./components/Table/ToolTable";
import BoardTable from "./components/Table/BoardTable";

const Dashboard = () => {
  const boards = useSelector((state) => state.board.boards);
  const tools = useSelector((state) => state.tool.tools);

  const [statusBoxes, setStatusBoxes] = useState([]);
  const [toolListOut, setToolListout] = useState([]);
  const [boardListOut, setBoardListout] = useState([]);

  const [toolTableElement] = useState([
    { minW: "7", maxW: "10", name: "รูปภาพ" },
    { minW: "18", maxW: "27", name: "ชื่ออุปกรณ์" },
    { minW: "15", maxW: "18", name: "รหัสอุปกรณ์" },
    { minW: "15", maxW: "18", name: "ชนิด" },
    { minW: "15", maxW: "18", name: "ประเภท" },
    { minW: "15", maxW: "18", name: "ขนาด" },
    { minW: "15", maxW: "20", name: "อื่นๆ" },
  ]);
  const [boardTableElement] = useState([
    { minW: "7", maxW: "27", name: "รูปภาพ" },
    { minW: "18", maxW: "27", name: "ชื่ออุปกรณ์" },
    { minW: "15", maxW: "27", name: "รหัสอุปกรณ์" },
    { minW: "15", maxW: "27", name: "ชนิด" },
    { minW: "15", maxW: "27", name: "อื่นๆ" },
  ]);

  useEffect(() => {
    let newArr = [];
    let AllItemTotalOut = 0;
    if (boards) {
      let boardOut = boards.filter((item) => item.total === 0);
      // AllItemOut = [...AllItemOut, ...boardOut];
      AllItemTotalOut += boardOut?.length;
      newArr.push({
        icon: <VscCircuitBoard className="equipment-box__icon icon--large" />,
        text: "จำนวนบอร์ด",
        total: boards.length,
      });
      setBoardListout(boardOut);
    }

    if (tools) {
      let toolOut = tools.filter((item) => item.total === 0);
      AllItemTotalOut += toolOut?.length;
      newArr.unshift({
        icon: <AiOutlineTool className="equipment-box__icon icon--large" />,
        text: "จำนวนอุปกรณ์",
        total: tools.length,
      });
      setToolListout(toolOut);
    }

    newArr.push({
      icon: <AiOutlineTool className="equipment-box__icon icon--large" />,
      text: "จำนวนของหมดทั้งหมด",
      total: AllItemTotalOut,
    });
    setStatusBoxes(newArr);

  }, [boards, tools]);
  return (
    <div className="dashboard">
      <Heading type="main" text="หน้าหลัก" />
      <EquipmentStatusBoxs data={statusBoxes} />
        <ToolTable state={toolTableElement} data={toolListOut} />
        <BoardTable state={boardTableElement} data={boardListOut} />
    </div>
  );
};

export default Dashboard;
