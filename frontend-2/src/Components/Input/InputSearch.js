import React from "react";
import { IoIosSearch } from "react-icons/io";
import Button from "../Button/Button";
import "./InputSearch.css";

const InputSearch = (props) => {
  const { text, onClickReset, suggestions, onTextChanged, onClickItem } = props;

  return (
    <div className={`inputSearch ${props.className}`}>
      <label htmlFor="search" className="inputSearch__label">
        {props.label}
      </label>
      <div className="inputSearch__form">
        <div className="inputSearch__input-box">
          <div className="inputSearch__icon-box">
            <IoIosSearch className="inputSearch__icon icon--medium" />
          </div>
          <input
            id="search"
            type="text"
            name="search"
            placeholder={props.placeholder}
            value={text}
            className="inputSearch__input"
            autoComplete="off"
            onChange={onTextChanged}
          />
          {(suggestions.length > 0 && text !== "") && (
            <ul className="inputSearch__list">
              {suggestions.map((item) => (
                <li
                  className="inputSearch__item"
                  key={item._id}
                  onClick={() => onClickItem(item)}
                >
                  {item?.toolName ? item.toolName : item.boardName}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button element="button" type="button" className="btn-primary-blue" onClick={onClickReset}>
          reset
        </Button>
      </div>
    </div>
  );
};

export default InputSearch;
