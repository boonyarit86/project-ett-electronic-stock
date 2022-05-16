import React from "react";
import Button from "../../../Components/Button/Button";
import Column from "../../../Components/Table/Column";
import Row from "../../../Components/Table/Row";
import Table from "../../../Components/Table/Table";
import Thead from "../../../Components/Table/Thead";
import Title from "../../../Components/Text/Title";
import Avatar from "../../../Components/Avatar/Avatar";

const UserTable = (props) => {
  const { state, handleOpenModal, handleOpenTag } =
    props;

  return (
    <>
      <Title className="table__title">ตารางผู้ใช้งาน</Title>
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
        {props.data.length > 0 ? (
          props.data.map((user, index) => (
            <React.Fragment key={index}>
              <Row>
                <Column minW={state[0].minW} maxW={state[0].maxW}>
                  <Avatar
                    shape="square"
                    src={user?.avatar?.url ? user.avatar.url : null}
                    className="icon--large"
                  />
                </Column>
                <Column minW={state[1].minW} maxW={state[1].maxW}>
                  <p className="table__col-text">{user.name}</p>
                </Column>
                <Column minW={state[2].minW} maxW={state[2].maxW}>
                  <p className="table__col-text">
                   {user.email}
                  </p>
                </Column>
                <Column minW={state[3].minW} maxW={state[3].maxW}>
                  <p className="table__col-text">
                    {user.role}
                  </p>
                </Column>
                <Column
                  minW={state[4].minW}
                  maxW={state[4].maxW}
                  className="table__col-btns"
                >
                  {/* {item.action === "เบิกบอร์ด" ||
                  item.action === "เพิ่มบอร์ด" ? (
                    <Button
                      element="button"
                      type="button"
                      className="btn-secondary-red"
                      onClick={() =>
                        handleOpenModal(
                          item.action.includes("เพิ่ม") ? "เพิ่ม" : "เบิก",
                          {
                            boardName: item?.board?.boardName,
                            total: item.total,
                            _id: item._id,
                          }
                        )
                      }
                    >
                      ยกเลิก
                    </Button>
                  ) : item.action === "เบิกบอร์ดพร้อมกับอุปกรณ์" ||
                    item.action.includes("อุปกรณ์ไม่ครบ") ? (
                    <Button
                      element="button"
                      type="button"
                      className="btn-secondary-red"
                      onClick={() =>
                        handleOpenModal("เบิกบอร์ดพร้อมกับอุปกรณ์", {
                          boardName: item?.board?.boardName,
                          total: item.total,
                          _id: item._id,
                          tools: item.tags[item.tags.length - 1].tools,
                        })
                      }
                    >
                      ยกเลิก
                    </Button>
                  ) : null} */}
                  <Button
                    element="button"
                    type="button"
                    className="btn-secondary-purple"
                    onClick={() => {}}
                  >
                    ดู
                  </Button>
                </Column>
              </Row>
            </React.Fragment>
          ))
        ) : (
          <Row>
            <div style={{ width: "100%", textAlign: "center" }}>
              ไม่พบข้อมูล
            </div>
          </Row>
        )}
      </Table>
    </>
  );
};

export default UserTable;
