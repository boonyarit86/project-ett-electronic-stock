import "./Table.css";

const Table = (props) => {
  return (
    <div className={`table ${props.className}`}>{props.children}</div>
  );
};

export default Table;