import React from "react";
import Backdrop from "../../../Components/Backdrop/Backdrop";
import Button from "../../../Components/Button/Button";
import Input from "../../../Components/Input/Input";
import ModalAction from "../../../Components/Modal/ModalAction";

const ModalCancel = ({ action, dataSelected, handleCloseModal, onSubmitAction, description, setDescription }) => {
  return (
    <React.Fragment>
      <ModalAction
        title={`ยกเลิกการ${action}`}
        itemName="อุปกรณ์"
        onClick={handleCloseModal}
      >
        <article className="modal__article">
          <div className="modal__item">
            <p className="modal__text">ชื่ออุปกรณ์</p>
            <p className="modal__text">{dataSelected.toolName}</p>
          </div>
          <div className="modal__item">
            <p className="modal__text">จำนวนในสต๊อก</p>
            <p className="modal__text">{dataSelected.total}</p>
          </div>
        </article>
        <form className="modal__form" onSubmit={onSubmitAction}>
          <Input
            element="textarea"
            label="รายละเอียดเพิ่มเติม"
            id="description"
            placeholder="ข้อมูลอื่นๆที่เกี่ยวกับอุปกรณ์"
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
            >
              ยืนยัน
            </Button>
          </div>
        </form>
      </ModalAction>
      <Backdrop black style={{ zIndex: 100 }} onClick={handleCloseModal} />
    </React.Fragment>
  );
};

export default ModalCancel;
