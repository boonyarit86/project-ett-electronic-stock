import moment from "moment";
import Moment from "react-moment";

export const time = () => {
    // function เรียงวันที่
    const formatDate = (data) => {
        let month = new Date(data).getMonth() + 1
        let date = new Date(data).getDate()
        let year = new Date(data).getFullYear()
        return month + "/" + date + "/" + year
    }

    // function เรียงเวลา
    const formatTime = (data) => {
        let hour = new Date(data).getHours()
        let minutes = new Date(data).getMinutes()
        return hour +":"+ minutes
    }

    return [formatDate, formatTime]

}

export const calculateNotificationTime = createdAt => {
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