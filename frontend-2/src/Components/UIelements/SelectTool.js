import React, { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import Button from "../Button/Button";
import Input from "../Input/Input";
import Toast from "../Toast/Toast";
import Select from "../Select/Select";
import "./SelectTool.css";

const SelectTool = (props) => {
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    toolSelected,
    setToolSelected,
    toolTotal,
    setToolTotal,
    toolType,
    setToolType,
    category,
    setCategory,
    categories,
    ttsInSelect,
    toolList,
    toolSelectedList,
    setToolSelectedList,
    initialData,
  } = props;

  const onClickSelectTool = () => {
    let hasTool = toolSelectedList.find((item) => item.tid === toolSelected);
    if (hasTool) {
      setErrorMessage(`อุปกรณ์ ${hasTool.toolName} มีอยู่แล้ว`);
      setTimeout(() => setErrorMessage(null), 8000);
    } else {
      let findToolById = initialData.find((item) => item._id === toolSelected);
      if (findToolById) {
        let tool = findToolById;
        let storeNewTool = {
          tid: tool._id,
          total: toolTotal || 0,
          toolName: tool.toolName,
        };
        setToolSelectedList((prev) => [...prev, storeNewTool]);
      }
    }

    setToolType("");
    setCategory("");
    setToolTotal("");
    setToolSelected("");
  };

  const deleteTool = (id) => {
    let data = toolSelectedList.filter((item) => item.tid !== id);
    setToolSelectedList(data);
  };

  return (
    <div className="selectTool">
      <p className="selectTool__header">อุปกรณ์ที่ใช้ในบอร์ด</p>
      <div className="selectTool__form">
        <div className="input__group">
          <Select
            label="ชนิด"
            id="type"
            placeholder="เลือกประเภทอุปกรณ์"
            setState={setToolType}
            state={toolType}
            fullWidth
            data={ttsInSelect.length > 0 ? ttsInSelect : []}
          />
          <Select
            label="ประเภท"
            id="categories"
            placeholder="เลือกประเภทอุปกรณ์"
            setState={setCategory}
            state={category}
            fullWidth
            data={categories.length > 0 ? categories : []}
          />
        </div>
        <div className="input__group">
          <Select
            label="ชื่อ"
            id="toolName"
            placeholder="เลือกชื่ออุปกรณ์"
            setState={setToolSelected}
            state={toolSelected}
            fullWidth
            data={toolList}
          />
          <Input
            element="input"
            type="number"
            label="จำนวนอุปกรณ์ที่ต้องใช้"
            id="total"
            placeholder="กรอกจำนวนอุปกรณ์"
            setState={setToolTotal}
            state={toolTotal}
            fullWidth
          />
        </div>
        <Button
          element="button"
          className="btn btn-primary-blue--outline btn--small"
          onClick={onClickSelectTool}
        >
          เพิ่ม
        </Button>
        <p className="selectTool__title">รายการอุปกรณ์ที่ถูกเลือก</p>
        {errorMessage && (
          <Toast
            element="error"
            type="default"
            message={errorMessage}
            style={{ marginBottom: "1rem" }}
            className="u-mg-b"
          />
        )}
        <ul className="selectTool__list">
          {toolSelectedList.length > 0 &&
            toolSelectedList.map((item) => (
              <li className="selectTool__item" key={item.tid}>
                <div className="selectTool__detail">
                  <p className="selectTool__toolName">{item.toolName}</p>
                  <span className="selectTool__total">จำนวน {item.total}</span>
                </div>
                <FiTrash2
                  className="selectTool__delete-icon icon--medium"
                  onClick={() => deleteTool(item.tid)}
                />
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default SelectTool;
