import React from "react";
import Avatar from "../../../Components/Avatar/Avatar";
import Button from "../../../Components/Button/Button";
import Column from "../../../Components/Table/Column";
import Row from "../../../Components/Table/Row";
import StatusText from "../../../Components/Tag/StatusText";
import Table from "../../../Components/Table/Table";
import Thead from "../../../Components/Table/Thead";
import Title from "../../../Components/Text/Title";
import { checkStatusUser } from "../../../utils/index";

const UserTable = (props) => {
  const { state, handleUserStatus, handleDeleteUser } = props;

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
                  <p className="table__col-text">{user.email}</p>
                </Column>
                <Column minW={state[3].minW} maxW={state[3].maxW}>
                <StatusText
                    text={user.role}
                    type={checkStatusUser(user.role)}
                  />
                </Column>
                <Column
                  minW={state[4].minW}
                  maxW={state[4].maxW}
                  className="table__col-btns"
                >
                  {user.role === "admin" ? (
                    "ไม่สามารถแก้ไขได้"
                  ) : (
                    <React.Fragment>
                      <Button
                        element="button"
                        type="button"
                        className="btn-primary-blue"
                        onClick={() => handleUserStatus(user.role, user._id)}
                      >
                        {user.role === "user"
                          ? "staff"
                          : user.role === "staff"
                          ? "user"
                          : "อนุมัติ"}
                      </Button>
                      <Button
                        element="button"
                        type="button"
                        className="btn-secondary-purple"
                        onClick={ () => user.role === "unapprove" ? handleDeleteUser(user._id) :  handleUserStatus("non-status", user._id)}
                      >
                        {user.role === "unapprove" ? "ปฎิเสธ" : "non-status"}
                      </Button>
                      {user.role !== "unapprove" && (
                        <Button
                          element="button"
                          type="button"
                          className="btn-secondary-red"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          ลบ
                        </Button>
                      )}
                    </React.Fragment>
                  )}
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
