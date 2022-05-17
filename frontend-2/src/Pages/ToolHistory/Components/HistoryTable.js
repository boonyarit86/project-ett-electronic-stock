import React from "react";
import { useSelector } from "react-redux";
import Button from "../../../Components/Button/Button";
import Column from "../../../Components/Table/Column";
import Row from "../../../Components/Table/Row";
import Table from "../../../Components/Table/Table";
import Thead from "../../../Components/Table/Thead";
import Title from "../../../Components/Text/Title";
import Pagination from "../../../Components/Table/Pagination";
import { time } from "../../../utils/Time";

const HistoryTable = (props) => {
  const { state, handleOpenModal, setState, initialData, handleOpenTag } =
    props;
  const user = useSelector((state) => state.user.user);
  const [formatDate, formatTime] = time();

  return (
    <>
      <Title className="table__title">ตารางรายการอุปกรณ์</Title>
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
          props.data.map((item, index) => (
            <React.Fragment key={index}>
              <Row>
                <Column minW={state[0].minW} maxW={state[0].maxW}>
                  <p className="table__col-text">{item.code}</p>
                </Column>
                <Column minW={state[1].minW} maxW={state[1].maxW}>
                  <p className="table__col-text">{formatDate(item.createAt)}</p>
                </Column>
                <Column minW={state[2].minW} maxW={state[2].maxW}>
                  <p className="table__col-text">
                    {item?.tool?.toolName ? item.tool.toolName : "ไม่ได้กำหนด"}
                  </p>
                </Column>
                <Column minW={state[3].minW} maxW={state[3].maxW}>
                  <p className="table__col-text">
                    {item?.creator?.name ? item.creator.name : "ไม่ได้กำหนด"}
                  </p>
                </Column>
                <Column minW={state[4].minW} maxW={state[4].maxW}>
                  <p className="table__col-text">
                    {item?.creator?.role ? item.creator.role : "ไม่ได้กำหนด"}
                  </p>
                </Column>
                <Column minW={state[5].minW} maxW={state[5].maxW}>
                  {item.action.includes("เพิ่ม") ? (
                    <p className="table__col-text" style={{ color: "#2f9e44" }}>
                      +{item.total}
                    </p>
                  ) : (
                    <p className="table__col-text" style={{ color: "#e03131" }}>
                      -{item.total}
                    </p>
                  )}
                </Column>
                <Column minW={state[6].minW} maxW={state[6].maxW}>
                  <p className="table__col-text">{formatTime(item.createAt)}</p>
                </Column>
                <Column minW={state[7].minW} maxW={state[7].maxW}>
                  <p className="table__col-text">{formatDate(item.exp)}</p>
                </Column>
                <Column
                  minW={state[8].minW}
                  maxW={state[8].maxW}
                  className="table__col-btns"
                >
                  {(item.action === "เบิกอุปกรณ์" ||
                    item.action === "เพิ่มอุปกรณ์") &&
                    (user?.role === "admin" || user?.role === "staff") && (
                      <Button
                        element="button"
                        type="button"
                        className="btn-secondary-red"
                        onClick={() =>
                          handleOpenModal(
                            item.action.includes("เพิ่ม") ? "เพิ่ม" : "เบิก",
                            {
                              toolName: item?.tool?.toolName,
                              total: item.total,
                              _id: item._id,
                            }
                          )
                        }
                      >
                        ยกเลิก
                      </Button>
                    )}
                  <Button
                    element="button"
                    type="button"
                    className="btn-secondary-purple"
                    onClick={() =>
                      handleOpenTag(item.tags, item?.tool?.toolName, item.code)
                    }
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
        <Pagination
          data={props.data}
          setState={setState}
          initialData={initialData}
        />
      </Table>
    </>
  );
};

export default HistoryTable;
