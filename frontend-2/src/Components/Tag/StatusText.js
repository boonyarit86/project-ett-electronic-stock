import "./StatusText.css";

const StatusText = (props) => {
    return <p className={`statusText statusText--${props.type}`} >{props.text}</p>
}

export default StatusText;