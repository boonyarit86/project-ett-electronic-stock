import Skeleton from "../Skeleton/Skeleton";
import "./EquipmentStatusBoxs.css";

const EquipmentStatusBoxs = (props) => {
  return (
    <>
      <div className="equipment-boxs">
        {props.data.length > 0
          ? props.data.map((item, index) => (
              <div className="equipment-box" key={index}>
                <div className="equipment-box__cover">{item.icon}</div>
                <article className="equipment-box__detail">
                  <p className="equipment-box__text">{item.text}</p>
                  <p className="equipment-box__number">{item.total}</p>
                </article>
              </div>
            ))
          : Array.from([1, 2, 3]).map((item) => (
              <div className="equipment-box" key={item}>
                <Skeleton element="image" shape="circle" width="5" height="5" />
                <div>
                  <Skeleton
                    element="text"
                    size="medium"
                    className="u-mg-b--sm"
                  />
                  <Skeleton element="text" size="small" />
                </div>
              </div>
            ))}
      </div>
    </>
  );
};

export default EquipmentStatusBoxs;
