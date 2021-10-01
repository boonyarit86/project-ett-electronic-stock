import React, { useState, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getIncompleteToolAction,
  requestIncompleteToolActions,
} from "../../actions/boardActions";
import { useForm } from "../../shared/hooks/form-hook";
import { makeStyles } from "@material-ui/core/styles";
import { AuthContext } from "../../shared/context/auth-context";
import { time } from "../../shared/utils/Time";

// Component
import ModalIncompleteBoard from "../components/ModalIncompleteBoard";
import { Button } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import Loading from "../../shared/components/UIElements/Loading";
// import { toast } from "react-toastify";

// CSS
import "./BoardIncomplete.css";

// toast.configure()

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  button: {
    margin: "20px 0",
  },
  buttonInTable: {
    margin: "5px 0",
  },
  margin: {
    margin: "10px 0",
  },
  form: {
    margin: "30px 0",
  },
}));

function BoardIncomplete() {
  // Function React
  const auth = useContext(AuthContext);
  const classes = useStyles();
  const dispatch = useDispatch();
  // Redux
  const getIncompleteBoard = useSelector((state) => state.incompleteTool);
  const { isLoading, isLoadingActions, lists, errorMsg, errorMsgActions } =
    getIncompleteBoard;
  // ตัวแปรเก็บค่าและกำหนดค่า
  const [openInput, setOpenInput] = useState(false);
  // const [toolSelected, setToolSelected] = useState({});
  const [headerPrompt, setHeaderPrompt] = useState("");
  // const [openPrompt, setOpenPrompt] = useState(false);
  // const [data, setData] = useState("");
  // const [promptType, setPromptType] = useState("");
  const [description, setDescription] = useState("");
  const [data, setData] = useState(null);

  // const notify = () => {
  //     toast.error("อุปกรณ์มีไม่เพียงพอในสต๊อก", { position: toast.POSITION.TOP_RIGHT, autoClose: 3000, className: "notify-success" })
  // }

  const [formState, inputHandler] = useForm(
    {
      total: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const [formatDate] = time();

  // เรียกข้อมูลรายการอุปกรณ์และอุปกรณ์คงค้างทั้งหมด
  useEffect(() => {
    dispatch(getIncompleteToolAction(auth.token));
    return () => {};
  }, []);

  // แสดงข้อมูลเมื่อเปิดแบบฟอร์ม
  const handleOpenInput = (item, tool) => {
    setOpenInput(true);
    let newData = {
      _id: item._id,
      hisbId: item.hisb._id,
      tool: tool,
    };
    setHeaderPrompt(`${tool.tool.toolName} ของบอร์ด ${item.board.boardName}`);
    setData(newData);
  };

  const handleCloseInput = () => {
    setOpenInput(false);
    setHeaderPrompt("");
    setData(null);
    setDescription("");
  };

  // ส่งข้อมูลไปยังฐานข้อมูล
  const handleSubmitInput = async (e) => {
    e.preventDefault();
    let newData = data;
    newData.description = description;
    newData.total = formState.inputs.total.value;
    dispatch(requestIncompleteToolActions(auth.token, newData));
    // console.log(newData)

    setOpenInput(false);
    setData(null);
    setHeaderPrompt("");
    setDescription("");
  };

  if (isLoading) {
    return <Loading loading={isLoading} />;
  }

  if (!isLoading && errorMsg) {
    return (
      <div style={{ margin: "10px" }}>
        <Alert variant="filled" severity="error">
          <AlertTitle>{errorMsg}</AlertTitle>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-incomplete">
      {isLoadingActions && <Loading loading={isLoadingActions} />}
      {!isLoadingActions && errorMsgActions && (
        <div style={{ margin: "10px" }}>
          <Alert variant="filled" severity="error">
            <AlertTitle>{errorMsgActions}</AlertTitle>
          </Alert>
        </div>
      )}
      <div className="section-incomplete">
        <div className="headername-incomplete">
          <h3>อุปกรณ์ไม่ครบ</h3>
        </div>
        <div className="items-incomplete">
          {lists &&
            lists.map((item) => (
              <div className="cover-incomplete" key={item._id}>
                <div className="header-incomplete">
                  <div className="proflie-img-incomplete">
                    <img
                      src={
                        item.user.avartar
                          ? item.user.avartar.url
                          : "/images/profile.png"
                      }
                      alt="555"
                    />
                  </div>
                  <div>
                    <p>
                      {item.user ? `${item.user.name} (${item.user.status})` : "ไม่มีข้อมูล"}
                    </p>
                    <p>{formatDate(item.hisb.date)}</p>
                  </div>
                </div>
                <div className="content-incomplete">
                  <h3>ชื่อบอร์ด {item.board.boardName}</h3>
                  <p>
                    <b>รหัสบอร์ด</b> {item.board.boardCode}
                  </p>
                  <div className="detail-incomplete">
                    <table className="table-incomplete">
                      <thead style={{ background: "#EAE6EB" }}>
                        <tr>
                          <th>ชื่ออุปกรณ์</th>
                          <th>ชนิด</th>
                          <th>ประเภท</th>
                          {/* <th>ขนาด</th> */}
                          <th>จำนวนค้าง</th>
                          <th>อื่นๆ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.tools.map((tool, index) => (
                          <tr key={tool._id}>
                            <th>{tool.tool.toolName}</th>
                            {/* <th>{tool.tool.type}</th> */}
                            <th>tcp</th>
                            <th>
                              nsp
                              {/* {tool.tool.category === ""
                                ? "ไม่ได้กำหนด"
                                : tool.tool.category} */}
                            </th>
                            {/* <th>{tool.size}</th> */}
                            <th>{tool.insuffTotal}</th>
                            <th>
                              <Button
                                type="button"
                                variant="outlined"
                                color="primary"
                                fullWidth
                                size="small"
                                className={classes.buttonInTable}
                                onClick={() => handleOpenInput(item, tool)}
                              >
                                เพิ่ม
                              </Button>
                            </th>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="figure-box"></div>
      <div className="figure-bar"></div>

      {data && (
        <ModalIncompleteBoard
          openPrompt={openInput}
          handleClosePrompt={handleCloseInput}
          headerPrompt={headerPrompt}
          handleSubmitPrompt={handleSubmitInput}
          formState={formState}
          inputHandler={inputHandler}
          setDescription={setDescription}
          data={data.tool}
        />
      )}
    </div>
  );
}

export default BoardIncomplete;
