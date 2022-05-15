import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "axios";
import Avatar from "../../Components/Avatar/Avatar";
import Button from "../../Components/Button/Button";
import Heading from "../../Components/Text/Heading";
import Toast from "../../Components/Toast/Toast";
import { endLoading, startLoading } from "../../Redux/features/stateSlice";
import { setInsts } from "../../Redux/features/instSlice";
import "./InsufficientTool.css";
import { catchError, catchRequestError } from "../../utils/handleError";
import { AuthContext } from "../../context/auth-context";
import { time } from "../../utils/Time";
import ModalAction from "../../Components/Modal/ModalAction";
import { VALIDATOR_REQUIRE } from "../../utils/validators";
import Backdrop from "../../Components/Backdrop/Backdrop";
import InputWithValidator from "../../Components/Input/InputWithValidator";
import Input from "../../Components/Input/Input";
import { useForm } from "../../hooks/form-hook";

const InsufficientTool = () => {
  const dispatch = useDispatch();
  const auth = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState(null);
  const [controller, setController] = useState(null);
  const { insts } = useSelector((state) => state.inst);
  const { tools } = useSelector((state) => state.tool);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState(null);
  const [description, setDescription] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [toolSelected, setToolSelected] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formatDate] = time();

  const [formState, inputHandler] = useForm(
    {
      total: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    if (!controller) {
      const ctrl = new AbortController();
      setController(ctrl);
      async function fetchData() {
        dispatch(startLoading());
        await Axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/boards/insufficientTool`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
            signal: ctrl.signal,
          }
        )
          .then((res) => {
            dispatch(endLoading());
            dispatch(setInsts(res.data.data.insufficientToolList));
            setIsLoading(false);
          })
          .catch((error) => {
            setIsLoading(false);
            dispatch(endLoading());
            catchRequestError(error, setRequestError);
          });
      }
      fetchData();
    }

    return () => controller && controller.abort();
  }, [controller, dispatch, auth.token]);

  const handleCloseModal = () => {
    setOpenModal(false);
    setToolSelected(null);
  };

  const handleOpenModal = (value) => {
    // toolCode, insufficientTotal, toolInStock
    let toolId = value.tid;
    let findToolById = tools.find((item) => item._id === toolId);
    if (findToolById) {
      setToolSelected({
        tid: toolId,
        toolCode: findToolById.toolCode,
        totalInStock: findToolById.total,
        toolName: findToolById.toolName,
        boardName: value.boardName,
        instId: value.instId
      });
      setOpenModal(true);
    } else {
      setErrorMessage("ไม่พบรายการอุปกรณ์นี้ กรุณารีโหลดหน้าจออีกครั้ง");
      setTimeout(() => setErrorMessage(null), 8000);
      setToolSelected(null);
      setOpenModal(false)
    }

    let mainElement = document.querySelector(".main");
    mainElement.scrollTo(0, 0);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    let data = {
      total: formState.inputs.total.value,
      tid: toolSelected.tid,
      description: description
    }

    // PATCH /insufficientTool/request/:insuffiTool_id
    try {
      dispatch(startLoading());
      await Axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/boards/insufficientTool/request/${toolSelected.instId}`,
        data,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      ).then((res) => {
        dispatch(endLoading());
        dispatch(setInsts(res.data.data.insufficientToolList));
        setSuccessMessage("ทำรายการเรียบร้อยแล้ว");
        setTimeout(() => setSuccessMessage(null), 10000);
      });
    } catch (error) {
      dispatch(endLoading());
      catchError(error, setErrorMessage);
    }

    console.log(data);
    setToolSelected(null);
    setOpenModal(false)
  }

  if (isLoading) return <div />;
  if (!isLoading && requestError) {
    return (
      <div className="insTool">
        <Toast
          element="error"
          type="default"
          message={requestError}
          className="u-mg-b"
        />
      </div>
    );
  }

  return (
    <div className="insTool">
      <Heading type="main" text="รายการอุปกรณ์ไม่พอ" className="u-mg-b" />
      {errorMessage && (
        <Toast
          element="error"
          type="default"
          message={errorMessage}
          className="u-mg-b"
        />
      )}
      {successMessage && (
        <Toast
          element="success"
          type="default"
          message={successMessage}
          className="u-mg-b"
        />
      )}
      <div className="insTool__list">
        {insts.length > 0 &&
          insts.map((item) => (
            <div className="insTool__item" key={item._id}>
              <div className="insTool__creator u-mg-b">
                <Avatar
                  shape="circle"
                  alt="user"
                  src={item.creator?.avatar?.url}
                  className="icon--large"
                />
                <div className="insTool__creator-detail">
                  <p>
                    {item.creator?.name} ({item.creator?.role})
                  </p>
                  <p>{formatDate(item.createAt)}</p>
                </div>
              </div>
              <ul className="insTool__board u-mg-b">
                <li className="insTool__article u-mg-b--sm">
                  <p className="insTool__article-title">ชื่อบอร์ด</p>
                  <p className="insTool__article-text">
                    {item.bh?.board?.boardName}
                  </p>
                </li>
                <li className="insTool__article u-mg-b--sm">
                  <p className="insTool__article-title">รหัสบอร์ด</p>
                  <p className="insTool__article-text">
                    {item.bh?.board?.boardCode}
                  </p>
                </li>
                <li className="insTool__article u-mg-b--sm">
                  <p className="insTool__article-title">เลขที่การเบิก</p>
                  <p className="insTool__article-text">{item.bh?.code}</p>
                </li>
              </ul>

              <p className="u-mg-b--md" style={{ fontWeight: 700 }}>
                รายการอุปกรณ์ไม่พอ
              </p>
              <div className="insTool__tools">
                {item.tools.length > 0 &&
                  item.tools.map((tool) => (
                    <div className="insTool__tool" key={tool._id}>
                      <p>{tool.detail?.toolName}</p>
                      <ul className="insTool__article-tools bg--palette">
                        <li className="insTool__article u-mg-b--sm">
                          <p className="insTool__article-title">ชนิด</p>
                          <p className="insTool__article-text">
                            {tool.type?.name}
                          </p>
                        </li>
                        <li className="insTool__article u-mg-b--sm">
                          <p className="insTool__article-title">ประเภท</p>
                          <p className="insTool__article-text">
                            {tool.category?.name}
                          </p>
                        </li>
                        <li className="insTool__article u-mg-b--sm">
                          <p className="insTool__article-title">จำนวนไม่พอ</p>
                          <p className="insTool__article-text">
                            {tool.insufficientTotal}
                          </p>
                        </li>
                      </ul>
                      <Button
                        element="button"
                        type="button"
                        className="btn btn-primary-blue btn--small"
                        fullWidth
                        onClick={() =>
                          handleOpenModal({
                            insufficientTotal: tool?.insufficientTotal,
                            tid: tool.detail?._id,
                            boardName: item.bh?.board?.boardName,
                            instId: item._id
                          })
                        }
                      >
                        เพิ่ม
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        <div className="insTool__item">
          <div className="insTool__creator u-mg-b">
            <Avatar
              shape="circle"
              alt="user"
              src="/images/avatars/user-2.jpg"
              className="icon--large"
            />
            <div className="insTool__creator-detail">
              <p>Yukino (admin)</p>
              <p>12/12/2021</p>
            </div>
          </div>
          <ul className="insTool__board u-mg-b">
            <li className="insTool__article u-mg-b--sm">
              <p className="insTool__article-title">ชื่อบอร์ด</p>
              <p className="insTool__article-text">ET-AEDUINO</p>
            </li>
            <li className="insTool__article u-mg-b--sm">
              <p className="insTool__article-title">รหัสบอร์ด</p>
              <p className="insTool__article-text">b001</p>
            </li>
            <li className="insTool__article u-mg-b--sm">
              <p className="insTool__article-title">เลขที่การเบิก</p>
              <p className="insTool__article-text">BH001</p>
            </li>
          </ul>

          <p className="u-mg-b--md" style={{ fontWeight: 700 }}>
            รายการอุปกรณ์ไม่พอ
          </p>
          <div className="insTool__tools">
            <div className="insTool__tool">
              <p>Tool Name</p>
              <ul className="insTool__article-tools bg--palette">
                <li className="insTool__article u-mg-b--sm">
                  <p className="insTool__article-title">ชนิด</p>
                  <p className="insTool__article-text">resister</p>
                </li>
                <li className="insTool__article u-mg-b--sm">
                  <p className="insTool__article-title">ประเภท</p>
                  <p className="insTool__article-text">resister</p>
                </li>
                <li className="insTool__article u-mg-b--sm">
                  <p className="insTool__article-title">จำนวนไม่พอ</p>
                  <p className="insTool__article-text">10</p>
                </li>
              </ul>
              <Button
                element="button"
                type="button"
                className="btn btn-primary-blue btn--small"
                fullWidth
              >
                เพิ่ม
              </Button>
            </div>
          </div>
        </div>

        <div className="insTool__item">
          <div className="insTool__creator u-mg-b">
            <Avatar
              shape="circle"
              alt="user"
              src="/images/avatars/user-2.jpg"
              className="icon--large"
            />
            <div className="insTool__creator-detail">
              <p>Yukino (admin)</p>
              <p>12/12/2021</p>
            </div>
          </div>
          <ul className="insTool__board u-mg-b">
            <li className="insTool__article u-mg-b--sm">
              <p className="insTool__article-title">ชื่อบอร์ด</p>
              <p className="insTool__article-text">ET-AEDUINO</p>
            </li>
            <li className="insTool__article u-mg-b--sm">
              <p className="insTool__article-title">รหัสบอร์ด</p>
              <p className="insTool__article-text">b001</p>
            </li>
            <li className="insTool__article u-mg-b--sm">
              <p className="insTool__article-title">เลขที่การเบิก</p>
              <p className="insTool__article-text">BH001</p>
            </li>
          </ul>

          <p className="u-mg-b--md" style={{ fontWeight: 700 }}>
            รายการอุปกรณ์ไม่พอ
          </p>
          <div className="insTool__tools">
            <div className="insTool__tool">
              <p>Tool Name</p>
              <ul className="insTool__article-tools bg--palette">
                <li className="insTool__article u-mg-b--sm">
                  <p className="insTool__article-title">ชนิด</p>
                  <p className="insTool__article-text">resister</p>
                </li>
                <li className="insTool__article u-mg-b--sm">
                  <p className="insTool__article-title">ประเภท</p>
                  <p className="insTool__article-text">resister</p>
                </li>
                <li className="insTool__article u-mg-b--sm">
                  <p className="insTool__article-title">จำนวนไม่พอ</p>
                  <p className="insTool__article-text">10</p>
                </li>
              </ul>
              <Button
                element="button"
                type="button"
                className="btn btn-primary-blue btn--small"
                fullWidth
              >
                เพิ่ม
              </Button>
            </div>
          </div>
        </div>
        
      </div>

      {openModal && (
        <React.Fragment>
          <ModalAction
            title="อัปเดต"
            itemName={` ${toolSelected.toolName} ของ ${toolSelected.boardName}`}
            onClick={handleCloseModal}
          >
            <article className="modal__article">
              <div className="modal__item">
                <p className="modal__text">รหัสอุปกรณ์</p>
                <p className="modal__text">{toolSelected.toolCode}</p>
              </div>
              <div className="modal__item">
                <p className="modal__text">จำนวนในสต๊อก</p>
                <p className="modal__text">{toolSelected.totalInStock}</p>
              </div>
            </article>
            <form className="modal__form" onSubmit={onSubmit}>
              <InputWithValidator
                element="input"
                type="number"
                label="จำนวน"
                id="total"
                placeholder="กรอกจำนวนบอร์ด"
                validators={[VALIDATOR_REQUIRE()]}
                onInput={inputHandler}
                errorMessage="กรุณากรอกจำนวนบอร์ด"
                required
                fullWidth
              />
              <Input
                element="textarea"
                label="รายละเอียดเพิ่มเติม"
                id="description"
                placeholder="ข้อมูลอื่นๆที่เกี่ยวกับบอร์ด"
                setState={setDescription}
                state={description}
                fullWidth
              />
              <div className="btn__group justify--left">
                <Button
                  type="button"
                  element="button"
                  className="btn-primary-blue--outline"
                  onClick={handleCloseModal}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  element="button"
                  className="btn-primary-blue"
                  disabled={!formState.isValid}
                >
                  อัปเดต
                </Button>
              </div>
            </form>
          </ModalAction>
          <Backdrop black style={{ zIndex: 100 }} onClick={handleCloseModal} />
        </React.Fragment>
      )}
    </div>
  );
};

export default InsufficientTool;
