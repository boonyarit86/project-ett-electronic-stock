import React from "react";
import Avatar from "../../../../Components/Avatar/Avatar";
import Button from "../../../../Components/Button/Button";
import Column from "../../../../Components/Table/Column";
import Row from "../../../../Components/Table/Row";
import Table from "../../../../Components/Table/Table";
import Thead from "../../../../Components/Table/Thead";
import Title from "../../../../Components/Text/Title";

const BoardTable = (props) => {
  const state = props.state;

  return (
    <>
      <Title className="table__title">รายการบอร์ดหมด</Title>
      {props.data.length > 0 ? (
        <Table>
          <Thead>
            {props.state.map((item, index) => (
              <React.Fragment key={index}>
                <Column minW={item.minW} maxW={item.maxW}>
                  <p className="table__header-text">{item.name}</p>
                </Column>
              </React.Fragment>
            ))}
          </Thead>
          {props.data.map((item, index) => (
            <React.Fragment key={index}>
              <Row>
                <Column minW={state[0].minW} maxW={state[0].maxW}>
                  <Avatar
                    shape="square"
                    src={item?.avatar?.url ? item.avatar.url : null}
                    className="icon--large"
                  />
                </Column>
                <Column minW={state[1].minW} maxW={state[1].maxW}>
                  <p className="table__col-text">{item.boardName}</p>
                </Column>
                <Column minW={state[2].minW} maxW={state[2].maxW}>
                  <p className="table__col-text">
                    {item?.boardCode ? item.boardCode : "ไม่ได้กำหนด"}
                  </p>
                </Column>
                <Column minW={state[3].minW} maxW={state[3].maxW}>
                  <p className="table__col-text">
                    {item?.type ? item.type : "ไม่ได้กำหนด"}
                  </p>
                </Column>
                <Column
                  minW={state[4].minW}
                  maxW={state[4].maxW}
                  className="table__col-btns"
                >
                  <Button
                    element="link"
                    type="button"
                    path={`/boardList/${item._id}`}
                    className="btn-primary-grey"
                  >
                    ดู
                  </Button>
                </Column>
              </Row>
            </React.Fragment>
          ))}
        </Table>
      ) : (
        <div>ไม่มีข้อมูลบอร์ด</div>
      )}
    </>
  );
};

export default BoardTable;
