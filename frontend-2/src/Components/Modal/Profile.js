import { AiOutlineClose } from "react-icons/ai";
import Title from "../Text/Title";
import Avatar from "../Avatar/Avatar";
import "./Profile.css";
import Button from "../Button/Button";

const Profile = (props) => {
    const user = props.user;

    return (
        <div className="profile">
            <div className="profile__header">
                <Title className="profile__h3">โพรไฟล์</Title>
                <AiOutlineClose className="profile__close-icon icon--medium" onClick={props.onClick} />
            </div>
            <div className="profile__intro">
                <Avatar src={user?.avatar?.url ? user.avatar.url : null} className="profile__avatar" alt="user avatar" shape="circle" />
                <article className="profile__detail">
                    <div className="profile__text-box">
                        <p className="profile__title">อีเมล์</p>
                        <p className="profile__text">{user?.email}</p>
                    </div>
                    <div className="profile__text-box">
                        <p className="profile__title">ชื่อ</p>
                        <p className="profile__text">{user?.name}</p>
                    </div>
                    <div className="profile__text-box">
                        <p className="profile__title">สถานะ</p>
                        <p className="profile__text">{user?.role}</p>
                    </div>
                    <Button element="button" className="btn-white" type="button" onClick={props.handleEditProfileModal}>แก้ไขโพรไฟล์</Button>
                </article>
            </div>
        </div>
    )
};

export default Profile;