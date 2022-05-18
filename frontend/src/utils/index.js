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

const checkStatusUser = (role) => {
  let response = { type: null };
  if (role === "admin") response.type = "primary-blue";
  else if (role === "staff") response.type = "secondary-purple";
  else if (role === "user") response.type = "secondary-red";
  else if (role === "unapprove") response.type = "default";
  return response.type;
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

export { checkStatus, calcDuration, checkStatusUser };
