import { AiOutlineClose } from "react-icons/ai";
import Title from "../Text/Title";
import "./ModalAction.css";
import "./Modal.css";

const ModalAction = (props) => {
  return (
    <div className="modal modalAction">
      <div className="modal__header">
        <Title className="modal__h3">{props.title}{props.itemName}</Title>
        <AiOutlineClose
          className="modal__close-icon icon--medium"
          onClick={props.onClick}
        />
      </div>
      {props.children}
    </div>
  );
};

export default ModalAction;
