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