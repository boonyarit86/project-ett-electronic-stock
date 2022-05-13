import React from "react";
import Avatar from "../../../Components/Avatar/Avatar";
import Button from "../../../Components/Button/Button";
import Column from "../../../Components/Table/Column";
import Row from "../../../Components/Table/Row";
import Table from "../../../Components/Table/Table";
import Thead from "../../../Components/Table/Thead";
import Title from "../../../Components/Text/Title";

const ToolTable = (props) => {
  const {state} = props;

  return (
    <>
      <Title className="table__title u-mg-t">อุปกรณ์ของบอร์ด</Title>
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
          {props.data.length > 0 ? props.data.map((item, index) => {
            let tool = item.detail;
            return (
            <React.Fragment key={index}>
              <Row>
                <Column minW={state[0].minW} maxW={state[0].maxW}>
                  <Avatar
                    shape="square"
                    src={tool?.avatar?.url ? tool.avatar.url : null}
                    className="icon--large"
                  />
                </Column>
                <Column minW={state[1].minW} maxW={state[1].maxW}>
                  <p className="table__col-text">{tool.toolName}</p>
                </Column>
                <Column minW={state[2].minW} maxW={state[2].maxW}>
                  <p className="table__col-text">
                    {tool?.toolCode ? tool.toolCode : "ไม่ได้กำหนด"}
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
                    {tool?.size ? tool.size : "ไม่ได้กำหนด"}
                  </p>
                </Column>
                <Column minW={state[6].minW} maxW={state[6].maxW}>
                  <p className="table__col-text">
                    {item.total}
                  </p>
                </Column>
                <Column
                  minW={state[7].minW}
                  maxW={state[7].maxW}
                  className="table__col-btns"
                >
                  <Button
                    element="link"
                    type="button"
                    path={`/toolList/${tool._id}`}
                    className="btn-primary-grey"
                  >
                    ดู
                  </Button>
                </Column>
              </Row>
            </React.Fragment>
            )
            }) : (
              <Row>
                  <div style={{width: "100%", textAlign: "center"}}>ไม่พบข้อมูล</div>
              </Row>
          )}
        </Table>
    </>
  );
};

export default ToolTable;
