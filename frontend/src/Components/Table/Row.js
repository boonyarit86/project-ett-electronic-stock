import "./Table.css";

const Row = (props) => {
  return (
    <div className="table__row">
      {props.children}
    </div>
  );
};

export default Row;
