import Button from "../../../../Components/Button/Button";
import Title from "../../../../Components/Text/Title";
import "../../../../Components/Table.css";

const BoardTable = (props) => {
  const state = props.state;

  return (
    <>
    <Title className="table__title">รายการบอร์ดหมด</Title>
      {props.data.length > 0 ? (
        <div className="table">
          <div className="table__headers">
            {props.state.map((item, index) => (
              <div
                className="table__header"
                key={index}
                style={{
                  minWidth: `${item.minW}rem`,
                  width: `${item.maxW}rem`,
                }}
              >
                <p className="table__header-text">{item.name}</p>
              </div>
            ))}
          </div>
          {props.data.map((item, index) => (
            <div className="table__row" key={index}>
              <div
                className="table__col"
                style={{
                  minWidth: `${state[0].minW}rem`,
                  width: `${state[0].maxW}rem`,
                }}
              >
                <img
                  className="icon--large"
                  src={
                    item?.avatar?.url
                      ? item.avatar.url
                      : null
                  }
                  alt="avatar"
                />
              </div>
              <div
                className="table__col"
                style={{
                  minWidth: `${state[1].minW}rem`,
                  width: `${state[1].maxW}rem`,
                }}
              >
                <p className="table__col-text">{item.boardName}</p>
              </div>

              <div
                className="table__col"
                style={{
                  minWidth: `${state[2].minW}rem`,
                  width: `${state[2].maxW}rem`,
                }}
              >
                <p className="table__col-text">{item?.boardCode ? item.boardCode : "ไม่ได้กำหนด"}</p>
              </div>
              <div
                className="table__col"
                style={{
                  minWidth: `${state[3].minW}rem`,
                  width: `${state[3].maxW}rem`,
                }}
              >
                <p className="table__col-text">{item?.type ? item.type : "ไม่ได้กำหนด"}</p>
              </div>
              <div
                className="table__col table__col-btns"
                style={{
                  minWidth: `${state[4].minW}rem`,
                  width: `${state[4].maxW}rem`,
                }}
              >
                <Button
                  element="link"
                  type="submit"
                  path="/"
                  className="btn-primary-grey"
                >
                  ดู
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>ไม่มีข้อมูลบอร์ด</div>
      )}
    </>
  );
};

export default BoardTable;
