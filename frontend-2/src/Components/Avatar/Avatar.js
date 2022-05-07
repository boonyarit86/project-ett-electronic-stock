import "./Avatar.css";

const Avatar = (props) => {
  return (
    <div className={`avatar ${props.className}`}>
      <img
        src={`${props.avatar ? props.avatar : "./images/avatars/user-1.jpg"}`}
        alt="avatar"
      />
    </div>
  );
};

export default Avatar;
