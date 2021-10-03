import React, { useState, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useHistory } from "react-router-dom";
import { AuthContext } from "../../shared/context/auth-context";
import { deleteBoardAction, getBoardAction } from "../../actions/boardActions";

// Component
import SlideImagePreview from '../../shared/components/UIElements/SlideImagePreview';
import ModalSubmit from "../components/ModalSubmit";
import { Avatar, Button, Divider } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import Loading from "../../shared/components/UIElements/Loading";
import { TableTool } from "../components/TableTool";

// Icon
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

// CSS
import "./DetailBoard.css";

function DetailBoard() {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const history = useHistory();
  const { board, isLoading, errorMsg, isLoadingDelete, errorMsgDelete } =
    useSelector((state) => state.boardList);
  const boardId = useParams().bid;
  const [previewImg, setPreviewImg] = useState(null);
  const [openPrompt, setOpenPrompt] = useState(false);

  // เรียกข้อมูลจากฐานข้อมูล
  useEffect(() => {
    dispatch(getBoardAction(auth.token, boardId));
    return () => {};
  }, [boardId]);

  const handleOpenPrompt = () => {
    setOpenPrompt(true);
  };

  const handleClosePrompt = () => {
    setOpenPrompt(false);
  };

  // Function ลบรายการบอร์ด
  const handleSubmitPrompt = async (e) => {
    e.preventDefault();
    setOpenPrompt(false);
    dispatch(deleteBoardAction(auth.token, boardId, history));
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
      {board && (
        <div>
          {isLoadingDelete && <Loading loading={isLoadingDelete} />}
          {!isLoadingDelete && errorMsgDelete && (
            <div style={{ margin: "10px" }}>
              <Alert variant="filled" severity="error">
                <AlertTitle>{errorMsgDelete}</AlertTitle>
              </Alert>
            </div>
          )}
          <h1>รายละเอียดบอร์ด {board.boardName}</h1>

          <div className="container-detailboard">
            <div>
              <div className="introl-img">
                <img
                  src={
                    !previewImg
                      ? !board.avartar
                        ? "/images/profile.png"
                        : board.avartar.url
                      : previewImg
                  }
                  alt=""
                />
              </div>
              {board.images.length === 0 ? (
                <div>ไม่มีรูปภาพ</div>
              ) : board.images.length <= 2 ? (
                <div className="detailboard-list-img">
                  {board.avartar && (
                  <Avatar
                    variant="square"
                    src={board.avartar.url}
                    onClick={() => setPreviewImg(board.avartar.url)}
                  />
                  )}
                  {board.images.map((img, index) => (
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
                  <SlideImagePreview
                        setPreviewImg={setPreviewImg}
                        images={board.images}
                        image={board.avartar}
                      />
                </div>
              )}
            </div>
            <div>
              <h2>{board.boardName}</h2>
              <div className="detailboard-list">
                <p>รหัสบอร์ด</p>
                <p>{board.boardCode}</p>
              </div>
              <div className="detailboard-list">
                <p>จำนวนบอร์ด</p>
                <p>{board.total}</p>
              </div>
              <div className="detailboard-list">
                <p>ชนิด</p>
                <p>{board.type}</p>
              </div>
              <div className="detailboard-list">
                <p>จะมีการแจ้งเตือนเมื่อจำนวนบอร์ดน้อยกว่า</p>
                <p>{board.limit}</p>
              </div>
              <div className="detailboard-list">
                <p>สถานะ</p>
                {Number(board.total) > Number(board.limit) ? (
                  <p>มี</p>
                ) : Number(board.total) === 0 ? (
                  <p style={{ color: "red" }}>หมด</p>
                ) : (
                  <p style={{ color: "orange" }}>กำลังจะหมด</p>
                )}
              </div>
              <div className="detailboard-des">
                <p>รายละเอียดเพิ่มเติม</p>
                <p>{board.description}</p>
              </div>
              <div className="detailboard-btn">
                {auth.userStatus === "admin" && (
                  <Link to={`/board/${board._id}`}>
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
                <Link to="/board/list">
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

          <Divider />
          <h2>อุปกรณ์ของบอร์ด {board.boardName}</h2>
          <TableTool tools={board.tools} />

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

export default DetailBoard;
