const checkStatus = (item) => {
    let response = {text: "มีในสต๊อก", type: "success"}
    if(item.total <= item.limit) {
        response.text = "ใกล้หมด";
        response.type = "warning";
    }
    if(item.total === 0) {
        response.text = "หมด";
        response.type = "error";
    }
    return response;
}

export {checkStatus};