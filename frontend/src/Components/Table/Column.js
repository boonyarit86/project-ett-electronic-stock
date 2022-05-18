import "./Table.css";

const Column = (props) => {
  return (
    <div
      className={`table__col ${props.className}`}
      style={{
        minWidth: `${props.minW}rem`,
        width: `${props.maxW}rem`,
      }}
    >
      {props.children}
    </div>
  );
};

export default Column;
