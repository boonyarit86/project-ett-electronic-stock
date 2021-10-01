const orderData = (data) => {
  let responseData = [];
  for (var round = 0; round < data.length; round++) {
      responseData.unshift(data[round]);
  }
  return responseData;
};

const covertTypeandCateTool2 = async (tools, stt) => {
  let arrTool = await tools.map((item) => {
    let data = stt.find((x) => x._id.toString() === item.tool.type);
    if (data) {
      let cate = data.categorys.find(
        (x) => x._id.toString() === item.tool.category
      );
      if (cate) {
        item.tool.category = cate.category;
      } else {
        item.tool.category = "ไม่ได้กำหนด";
      }
      item.tool.type = data.type;
      return item;
    } else {
      item.tool.type = "ไม่ได้กำหนด";
      item.tool.category = "ไม่ได้กำหนด";
      return item;
    }
    // return item
  });
  // console.log(arrTool)
  return arrTool;
};

const covertTypeandCateTool3 = async (tool, stt) => {
  let data = stt.find((x) => x._id.toString() === tool.type);
  if (data) {
    let cate = data.categorys.find((x) => x._id.toString() === tool.category);
    if (cate) {
      tool.category = cate.category;
    } else {
      tool.category = "ไม่ได้กำหนด";
    }
    tool.type = data.type;
    // tool.type = "ไม่ได้กำหนด";
  } else {
    tool.type = "ไม่ได้กำหนด";
    tool.category = "ไม่ได้กำหนด";
  }
};

exports.orderData = orderData;
exports.covertTypeandCateTool2 = covertTypeandCateTool2;
exports.covertTypeandCateTool3 = covertTypeandCateTool3;

// Sort from latest date to oldest date and Check expairation of data.
// const orderData = (data) => {
//   let responseData = []
//     for (var round = 0; round < data.length; round++) {
//         let index = data.length - 1 - round
//         responseData = [...responseData, data[index]]
//     }
//     return responseData
// }


// const orderData = (data) => {
//   let responseData = [];
//   for (var round = 0; round < data.length; round++) {
//     if (data[round].tool !== null) {
//       let expHistory = new Date(data[round].exp).getTime();
//       let currentDate = new Date().getTime();
//       if (expHistory < currentDate) {
//         let deleteData = async () => {
//           await data[round].remove();
//         }
//         deleteData()
//         console.log("Deleting...")
//       } else {
//         responseData.unshift(data[round]);
//       }
//     }
//   }
//   return responseData;
// };
