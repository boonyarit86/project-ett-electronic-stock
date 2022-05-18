import React from "react";
import Backdrop from "../../../Components/Backdrop/Backdrop";
import Button from "../../../Components/Button/Button";
import Input from "../../../Components/Input/Input";
import ModalAction from "../../../Components/Modal/ModalAction";
import ToastToolList from "./ToastToolList";

const ModalCancel = ({ action, dataSelected, handleCloseModal, onSubmitAction, description, setDescription }) => {
  return (
    <React.Fragment>
      <ModalAction
        title={`ยกเลิกการ${action}`}
        itemName="บอร์ด"
        onClick={handleCloseModal}
      >
        <article className="modal__article">
          <div className="modal__item">
            <p className="modal__text">ชื่อบอร์ด</p>
            <p className="modal__text">{dataSelected.boardName}</p>
          </div>
          <div className="modal__item">
            <p className="modal__text">จำนวนยกเลิก</p>
            <p className="modal__text">{dataSelected.total}</p>
          </div>
        </article>
        {dataSelected?.tools?.length > 0 && (
          <ToastToolList data={dataSelected.tools} title="รายการอุปกรณ์ที่ต้องคืนทั้งหมด" action="ยกเลิกการเบิกบอร์ดพร้อมอุปกรณ์" />
        )}
        <form className="modal__form" onSubmit={onSubmitAction}>
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
