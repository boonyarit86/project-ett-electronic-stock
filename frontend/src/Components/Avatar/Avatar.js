import "./Avatar.css";

const Avatar = (props) => {
  return (
    <div className={`avatar ${props.className}`} onClick={props.onClick}>
      <img
        className={`avatar__shape--${props.shape}`}
        src={`${props.src || "/images/empty-img.png"}`}
        alt={props.alt || "avatar"}
      />
    </div>
  );
};

export default Avatar;
