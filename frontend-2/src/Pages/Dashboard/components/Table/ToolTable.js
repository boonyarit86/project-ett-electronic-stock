import Avatar from "../../../../Components/Avatar/Avatar";
import Button from "../../../../Components/Button/Button";
import Column from "../../../../Components/Table/Column";
import Row from "../../../../Components/Table/Row";
import Table from "../../../../Components/Table/Table";
import Thead from "../../../../Components/Table/Thead";
import Title from "../../../../Components/Text/Title";
import React from "react";

const ToolTable = (props) => {
  const state = props.state;

  return (
    <>
      <Title className="table__title">รายการอุปกรณ์หมด</Title>
      {props.data.length > 0 ? (
        <Table className="u-mg-b">
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
                  <p className="table__col-text">{item.toolName}</p>
                </Column>
                <Column minW={state[2].minW} maxW={state[2].maxW}>
                  <p className="table__col-text">
                    {item?.toolCode ? item.toolCode : "ไม่ได้กำหนด"}
                  </p>
                </Column>
                <Column minW={state[3].minW} maxW={state[3].maxW}>
                  <p className="table__col-text">{item.type.name}</p>
                </Column>
                <Column minW={state[4].minW} maxW={state[4].maxW}>
                  <p className="table__col-text">
                    {item?.category?.name ? item.category.name : "ไม่ได้กำหนด"}
                  </p>
                </Column>
                <Column minW={state[5].minW} maxW={state[5].maxW}>
                  <p className="table__col-text">
                    {item?.size ? item.size : "ไม่ได้กำหนด"}
                  </p>
                </Column>
                <Column
                  minW={state[6].minW}
                  maxW={state[6].maxW}
                  className="table__col-btns"
                >
                  <Button
                    element="link"
                    type="button"
                    path={`/toolList/${item._id}`}
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
        <div className="text-box u-mg-b--sm-2">ไม่มีข้อมูลอุปกรณ์</div>
      )}
    </>
  );
};

export default ToolTable;
