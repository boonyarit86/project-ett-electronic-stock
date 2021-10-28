import moment from "moment";
import Moment from "react-moment";

const calculateTime = createdAt => {
  const today = moment(Date.now());
  const postDate = moment(createdAt);
  const diffInHours = today.diff(postDate, "hours");

  if (diffInHours < 24) {
    return (
      <>
        {diffInHours >= 1 ? `${diffInHours} ชั่วโมงที่แล้ว` : "ล่าสุด"} 
      </>
    );
  } else if (diffInHours >= 24 && diffInHours < 36 ) {
    return (
      <>
        เมื่อวาน <Moment format="hh:mm A">{createdAt}</Moment>
      </>
    );
  } else if (diffInHours > 36) {
    return <Moment format="DD/MM/YYYY hh:mm A">{createdAt}</Moment>;
  }
};

export default calculateTime;
