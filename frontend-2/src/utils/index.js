const checkStatus = (item) => {
  let response = { text: "มีในสต๊อก", type: "success" };
  if (item.total <= item.limit) {
    response.text = "ใกล้หมด";
    response.type = "warning";
  }
  if (item.total === 0) {
    response.text = "หมด";
    response.type = "error";
  }
  return response;
};

function calcDuration(initialData, duration, setState) {
  let currentTime = new Date().getTime();
  if (Number(duration) === 0) {
    setState(initialData);
  } else {
    const timeFilter = (createAt) =>
      new Date(createAt).getTime() + 1000 * 60 * (1440 * Number(duration));
    let docs = initialData.filter(
      (item) => timeFilter(item.createAt) >= currentTime
    );
    setState(docs);
  }
}

export { checkStatus, calcDuration };
