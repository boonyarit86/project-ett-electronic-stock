import React, { useEffect, useState, useContext } from "react";
import Axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import EquipmentStatusBoxs from "../../Components/EquipmentStatusBox/EquipmentStatusBoxs";
import Heading from "../../Components/Text/Heading";
import ToolTable from "./Components/ToolTable";
import Toast from "../../Components/Toast/Toast";
import { startLoading, endLoading } from "../../Redux/features/stateSlice";
import { AuthContext } from "../../context/auth-context";
import { catchRequestError } from "../../utils/handleError";
import { AiOutlineTool } from "react-icons/ai";
import Select from "../../Components/Select/Select";
import { setTts } from "../../Redux/features/ttsSlice";
import Skeleton from "../../Components/Skeleton/Skeleton";
import "./ToolList.css";

const ToolList = () => {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const tools = useSelector((state) => state.tool.tools);
  const { ttsInSelect } = useSelector((state) => state.tts);
  const [controller, setController] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState(null);
  const [toolList, setToolList] = useState([]);
  const [toolFilter, setToolFilter] = useState([]);
  const [toolStatus, setToolStatus] = useState(0);
  const [statusBoxes, setStatusBoxes] = useState([]);
  const [types, setTypes] = useState([]);
  const [toolType, setToolType] = useState(0);

  const [toolTableElement] = useState([
    { minW: "7", maxW: "10", name: "รูปภาพ" },
    { minW: "18", maxW: "27", name: "ชื่ออุปกรณ์" },
    { minW: "10", maxW: "12", name: "สถานะ" },
    { minW: "10", maxW: "12", name: "จำนวน" },
    { minW: "12", maxW: "15", name: "รหัสอุปกรณ์" },
    { minW: "12", maxW: "15", name: "ชนิด" },
    { minW: "12", maxW: "15", name: "ประเภท" },
    { minW: "10", maxW: "12", name: "ขนาด" },
    { minW: "27", maxW: "30", name: "อื่นๆ" },
  ]);

  useEffect(() => {
    if (tools.length !== 0) {
      let toolOut = tools.filter((item) => item.total === 0);
      let toolRunningOut = tools.filter((item) => item.total <= item.limit);
      let newArr = [
        {
          icon: <AiOutlineTool className="equipment-box__icon icon--large" />,
          text: "จำนวนอุปกรณ์",
          total: tools.length,
        },
        {
          icon: <AiOutlineTool className="equipment-box__icon icon--large" />,
          text: "จำนวนอุปกรณ์ใกล้หมด",
          total: toolRunningOut.length,
        },
        {
          icon: <AiOutlineTool className="equipment-box__icon icon--large" />,
          text: "จำนวนอุปกรณ์หมด",
          total: toolOut.length,
        },
      ];
      setStatusBoxes(newArr);
      setToolList(tools);
      setToolFilter(tools);
    }
  }, [tools]);

  useEffect(() => {
    // if (Number(toolStatus) === 0) {
    //   setToolList(tools);
    // }
    // if (Number(toolStatus) === 1) {
    //   let toolGoingOut = tools.filter(
    //     (item) => item.total <= item.limit && item.total !== 0
    //   );
    //   setToolList(toolGoingOut);
    // }
    // if (Number(toolStatus) === 2) {
    //   let toolOut = tools.filter((item) => item.total === 0);
    //   setToolList(toolOut);
    // }

    let data = [...tools];
    if (Number(toolStatus) === 1) {
      data = data.filter((item) => item.total <= item.limit && item.total !== 0);
    } else if (Number(toolStatus) === 2) {
      data = data.filter((item) => item.total === 0);
    }

    if (Number(toolType) !== 0) {
      data = data.filter((item) => item.type._id === toolType);
    }
    setToolList(data);
  }, [toolStatus, tools, toolType]);

  //   useEffect(() => {
  //     if(Number(toolType) === 0) {
  //         setToolList(tools);
  //     } else {
  //         let filterData = tools.filter((item) => item.type._id === toolType);
  //         setToolList(filterData);
  //     }
  //   }, [toolType, tools])

  //   console.log(ttsInSelect);
  //   console.log(toolList)
  //   console.log(`ToolList: ${toolList.length} & ToolFilter: ${toolFilter.length}`)
  // console.log(typeof(toolStatus))

  useEffect(() => {
    if (!controller) {
      const ctrl = new AbortController();
      setController(ctrl);
      async function fetchDataTts() {
        await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/tts`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          signal: ctrl.signal,
        })
          .then((res) => {
            dispatch(setTts(res.data.data.tts));
            setIsLoading(false);
          })
          .catch((error) => {
            setIsLoading(false);
            catchRequestError(error, setRequestError);
          });
      }
      fetchDataTts();
    }

    return () => controller && controller.abort();
  }, [controller, dispatch, auth.token]);

  useEffect(() => {
    if (ttsInSelect.length > 0) {
      let initialValue = [...ttsInSelect];
      initialValue.unshift({ name: "ทั้งหมด", value: 0 });
      setTypes(initialValue);
    }
  }, [ttsInSelect]);

  if (requestError && !isLoading) {
    return (
      <div className="createTool">
        <Toast
          element="error"
          type="default"
          message={requestError}
          style={{ marginBottom: "1rem" }}
        />
      </div>
    );
  }

  return (
    <div className="toolList">
      <Heading type="main" text="รายการอุปกรณ์" className="u-mg-b" />
      <EquipmentStatusBoxs data={statusBoxes} />
      <div className="toolList__filter">
        <Select
          label="สถานะอุปกรณ์"
          id="status"
          setState={setToolStatus}
          state={toolStatus}
          fullWidth
          data={[
            { name: "ทั้งหมด", value: 0 },
            { name: "กำลังหมด", value: 1 },
            { name: "หมด", value: 2 },
          ]}
        />
        {isLoading ? (
          <div>
            <Skeleton
              element="text"
              size="medium"
              style={{ marginBottom: "0.5rem", height: "2.2rem" }}
            />
            <Skeleton
              element="text"
              className="fullWidth"
              style={{ height: "4rem" }}
            />
          </div>
        ) : (
          <Select
            label="ชนิดอุปกรณ์"
            id="types"
            setState={setToolType}
            state={toolType}
            fullWidth
            data={types.length > 0 ? types : []}
          />
        )}
      </div>

      <ToolTable
        state={toolTableElement}
        data={toolFilter}
        initialData={toolList}
        setState={setToolFilter}
      />
    </div>
  );
};

export default ToolList;
