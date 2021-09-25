import React, { useState, useContext, useEffect } from "react";
import { Link, useParams, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../../shared/context/auth-context";
import { getToolAction, deleteToolAction } from "../../actions/toolActions";

// Component
// import SlideImagePreview from "../../shared/components/UIElements/SlideImagePreview";
import ModalSubmit from "../components/ModalSubmit";
import { Avatar, Button } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import Loading from "../../shared/components/UIElements/Loading";

// Icon
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

// CSS
import "./DetailTool.css";

function DetailTool() {
  // Function React
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const history = useHistory();
  const toolId = useParams().tid;
  // Redux
  const { tool, isLoading, errorMsg, isLoadingDelete, errorMsgDelete } = useSelector((state) => state.toolList);
  //   const deleteTool = useSelector((state) => state.deleteTool);
  // ตัวแปรเก็บค่า
  const [previewImg, setPreviewImg] = useState(null);
  const [openPrompt, setOpenPrompt] = useState(false);
  // เรียกข้อมูลจากฐานข้อมูล
  useEffect(() => {
    dispatch(getToolAction(auth.token, toolId));
    return () => {};
  }, [toolId]);

  const handleOpenPrompt = () => {
    setOpenPrompt(true);
  };

  const handleClosePrompt = () => {
    setOpenPrompt(false);
  };

  const handleSubmitPrompt = async (e) => {
    e.preventDefault();
    setOpenPrompt(false);
    dispatch(deleteToolAction(auth.token, toolId, history));
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
    <>
      {tool && (
        <div>
          {isLoadingDelete && <Loading loading={isLoadingDelete} />}
          {!isLoadingDelete && errorMsgDelete && (
            <div style={{ margin: "10px" }}>
              <Alert variant="filled" severity="error">
                <AlertTitle>{errorMsgDelete}</AlertTitle>
              </Alert>
            </div>
          )}

          <h1>รายละเอียดอุปกรณ์ของ {tool.toolName}</h1>

          <div className="container-detailtool">
            <div>
              <div className="introl-img">
                <img src={!previewImg ? !tool.avartar ? "/images/profile.png" : tool.avartar.url : previewImg} alt="" />
              </div>
              {tool.images.length === 0 ? (
                <div>ไม่มีรูปภาพ</div>
              ) : tool.images.length <= 3 ? (
                <div className="detailtool-list-img">
                  { tool.avartar && (
                  <Avatar
                    variant="square"
                    src={tool.avartar.url}
                    onClick={() => setPreviewImg(tool.avartar.url)}
                  />
                  )}
                  {tool.images.map((img, index) => (
                    <Avatar
                      variant="square"
                      src={img.url}
                      key={index}
                      onClick={() => setPreviewImg(img.url)}
                    />
                  ))}
                </div>
              ) : (
                <div>
                  {/* <SlideImagePreview
                        setPreviewImg={setPreviewImg}
                        images={tool.images}
                      /> */}
                </div>
              )}
            </div>
            {/* <div>
            {tool.imageProfile === undefined ? (
              <div>Loading...</div>
            ) : (
              <div className="introl-img">
                <img src={previewImg || tool.imageProfile.location} alt="" />
              </div>
            )}
            {tool.images === undefined || tool.images.length === 0 ? (
              <div>ไม่มีรูปภาพ</div>
            ) : tool.images.length <= 3 ? (
              <div className="detailtool-list-img">
                {tool.images.map((img, index) => (
                  <Avatar
                    variant="square"
                    src={img.location}
                    key={index}
                    onClick={() => setPreviewImg(img.location)}
                  />
                ))}
              </div>
            ) : (
              <div>
                <SlideImagePreview
                  setPreviewImg={setPreviewImg}
                  images={tool.images}
                />
              </div>
            )}
          </div> */}
            <div>
              <h2>{tool.toolName}</h2>
              <div className="detailtool-list">
                <p>รหัสอุปกรณ์</p>
                <p>{tool.toolCode}</p>
              </div>
              <div className="detailtool-list">
                <p>จำนวนอุปกรณ์</p>
                <p>{tool.total}</p>
              </div>
              <div className="detailtool-list">
                <p>ชนิด</p>
                <p>{tool.type}</p>
              </div>
              <div className="detailtool-list">
                <p>ประเภท</p>
                <p>{tool.category}</p>
              </div>
              <div className="detailtool-list">
                <p>จะมีการแจ้งเตือนเมื่อจำนวนอุปกรณ์น้อยกว่า </p>
                <p>{tool.limit}</p>
              </div>
              <div className="detailtool-list">
                <p>สถานะ</p>
                {Number(tool.total) > Number(tool.limit) ? (
                  <p>มี</p>
                ) : Number(tool.total) === 0 ? (
                  <p style={{ color: "red" }}>หมด</p>
                ) : (
                  <p style={{ color: "orange" }}>กำลังจะหมด</p>
                )}
              </div>
              <div className="detailtool-des">
                <p>รายละเอียดเพิ่มเติม</p>
                <p>{tool.description}</p>
              </div>
              <div className="detailtool-btn">
                {auth.userStatus === "admin" && (
                  <Link to={`/tool/${tool._id}`}>
                    <Button
                      color="primary"
                      type="button"
                      variant="contained"
                      startIcon={<EditIcon />}
                    >
                      แก้ไข
                    </Button>
                  </Link>
                )}
                {auth.userStatus === "admin" && (
                  <Button
                    color="secondary"
                    type="button"
                    variant="contained"
                    startIcon={<DeleteIcon />}
                    onClick={handleOpenPrompt}
                  >
                    ลบ
                  </Button>
                )}
                <Link to="/tool/list">
                  <Button
                    type="button"
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                  >
                    กลับ
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <ModalSubmit
        openPrompt={openPrompt}
        setOpenPrompt={setOpenPrompt}
        handleClosePrompt={handleClosePrompt}
        handleSubmitPrompt={handleSubmitPrompt}
      />
        </div>
      )}
    </>
  );
}

export default DetailTool;
