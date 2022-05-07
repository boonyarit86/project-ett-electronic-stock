import "./Backdrop.css";

const Backdrop = (props) => {
    return <div className={`backdrop ${props.black && 'backdrop--black'}`} onClick={props.onClick} />
}

export default Backdrop;