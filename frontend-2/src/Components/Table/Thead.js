import "./Table.css";

const Thead = (props) => {
  return (
    <div className={`table__headers ${props.className}`}>{props.children}</div>
  );
};

export default Thead;
