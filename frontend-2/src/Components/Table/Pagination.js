import React, { useState, useEffect } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import "./Pagination.css";

const getStartNumber = (initialData, startItem) => {
  if (initialData.length === 0) {
    return 0;
  }
  return startItem;
};
const getEndNumber = (currentPage, initialData, endItem, pages) => {
  if (initialData.length === 0) {
    return 0;
  }
  if (pages === currentPage && initialData !== 0) {
    return initialData.length;
  }
  return endItem;
};

const Pagination = (props) => {
  const [rowPerPage, setRowPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [startItem, setStartItem] = useState(1);
  const [endItem, setendItem] = useState(5);
  const setState = props.setState;
  const initialData = props.initialData;

  useEffect(() => {
    let calTotalPages = Math.ceil(initialData.length / rowPerPage);
    let calStartItem;
    let calEndItem;
    if (initialData.length === 0) {
      setCurrentPage(1);
    }
    if (rowPerPage >= initialData.length && initialData.length !== 0) {
      calStartItem = 1;
      calEndItem = initialData.length;
      setStartItem(calStartItem);
      setendItem(calEndItem);
      setPages(calTotalPages);
      setCurrentPage(1);
    } else {
      calStartItem = rowPerPage * (currentPage - 1) + 1;
      calEndItem = rowPerPage * currentPage;
      setStartItem(calStartItem);
      setendItem(calEndItem);
      setPages(calTotalPages);
    }
    let filterData = initialData.slice(calStartItem - 1, calEndItem);
    setState(filterData);
  }, [currentPage, rowPerPage, initialData, setState]);

  useEffect(() => {
    const paginationBack = document.getElementById("pagination__back");
    const paginationForward = document.getElementById("pagination__forward");
    if (initialData.length === 0 || initialData.length === rowPerPage) {
      paginationBack.classList.add("disabled");
      paginationForward.classList.add("disabled");
    } else {
      if (currentPage === 1) {
        paginationBack.classList.add("disabled");
      } else {
        paginationBack.classList.remove("disabled");
      }
      if (initialData.length > 1 && currentPage !== pages) {
        paginationForward.classList.remove("disabled");
      } else {
        paginationForward.classList.add("disabled");
      }
    }
  }, [currentPage, pages, initialData]);

  const onChange = (e) => {
    let value = Number(e.target.value);
    setRowPerPage(value);
  };

  const nextPage = () => {
    let lastPage = pages - currentPage;
    if (lastPage !== 0) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  const backPage = () => {
    if (currentPage !== 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="pagination">
      <div className="pagination__select">
        <span>Row per page: </span>
        <select
          name="rowPage"
          value={rowPerPage}
          onChange={onChange}
          className="pagination__input"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
        </select>
      </div>
      <p>
        {getStartNumber(initialData, startItem)}-
        {getEndNumber(currentPage, initialData, endItem, pages)} ของ{" "}
        {initialData.length}
      </p>
      <div className="btn__group">
        <div
          className="pagination__icon icon--large"
          id="pagination__back"
          onClick={backPage}
        >
          <IoIosArrowBack className="icon--medium" />
        </div>
        <div
          className="pagination__icon icon--large"
          id="pagination__forward"
          onClick={nextPage}
        >
          <IoIosArrowForward className="icon--medium" />
        </div>
      </div>
    </div>
  );
};

export default Pagination;

// console.log(
//   `cur: ${currentPage}, data: ${initialData.length}, pages: ${pages}`
// );
