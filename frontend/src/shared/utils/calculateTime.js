import moment from "moment";
import Moment from "react-moment";

const calculateTime = createdAt => {
  const today = moment(Date.now());
  const postDate = moment(createdAt);
  const diffInHours = today.diff(postDate, "hours");

  if (diffInHours < 24) {
    return (
      <>
        วันนี้ <Moment format="hh:mm A">{createdAt}</Moment>
      </>
    );
  } else if (diffInHours < 48 ) {
    return (
      <>
        เมื่อวาน <Moment format="hh:mm A">{createdAt}</Moment>
      </>
    );
  } else if (diffInHours > 48) {
    return <Moment format="DD/MM/YYYY hh:mm A">{createdAt}</Moment>;
  }
};

export default calculateTime;
