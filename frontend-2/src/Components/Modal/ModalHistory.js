import { AiOutlineClose } from "react-icons/ai";
import "./Modal.css";
import "./ModalHistory.css";

const ModalHistory = (props) => {
  return (
    <div className="modal modalHistory">
      <div className="modalHistory__header">
        <div className="modalHistory__tags">
          {props.tags.map((tag, index) => (
            <div
              className={`modalHistory__tag icon--medium ${
                index === 0 ? "active" : ""
              }`}
              id={`htag-${index}`}
              onClick={() => props.handleCurrentTag(index)}
              key={index}
            >
              <span className="modalHistory__tag-number">{index + 1}</span>
            </div>
          ))}
        </div>
        <AiOutlineClose
          className="profile__close-icon icon--medium"
          onClick={props.onClick}
        />
      </div>
      {props.children}
    </div>
  );
};

export default ModalHistory;
