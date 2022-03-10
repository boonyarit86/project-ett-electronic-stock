const { historyExpire, boardExist } = require("./index");

let initialValue = "ไม่ได้กำหนด";

// ----------- Secondary Functions ----------------

const orderData = (data) => {
  let responseData = [];
  for (var round = 0; round < data.length; round++) {
    responseData.unshift(data[round]);
  }
  return responseData;
};

async function setToolCategory(item, tool) {
  let doesToolCategoryMatch = await tool.categorys.find(
    (x) => x._id.toString() === item.category
  );
  if (doesToolCategoryMatch) {
    item.category = doesToolCategoryMatch.category;
  } else {
    item.category = initialValue;
  }
}

function setToolType(item, tool) {
  item.type = tool.type;
}

function setEmptyValue(item) {
  item.type = initialValue;
  item.category = initialValue;
}


// ----------- Initial Functions ----------------

const covertTypeandCateTool = async (tools, stt) => {
  let toolList = await tools.map(async (item) => {
    let doesToolTypeMatch = await stt.find((x) => x._id.toString() === item.type);
    let tooldetail = doesToolTypeMatch;
    if (doesToolTypeMatch) {
      setToolCategory(item, tooldetail);
      setToolType(item, tooldetail);
      return item;
    } else {
      setEmptyValue(item);
      return item;
    }
    // return item
  });

  return toolList;
};

const covertTypeandCateTool2 = async (tools, stt) => {
  let toolList = await tools.map(async (item) => {
    let doesToolTypeHistoryMatch = await stt.find(
      (x) => x._id.toString() === item.tool.type
    );
    let toolHistoryDetail = doesToolTypeHistoryMatch;

    if (doesToolTypeHistoryMatch) {
      setToolCategory(item.tool, toolHistoryDetail);
      setToolType(item.tool, toolHistoryDetail);
      return item;
    } else {
      setEmptyValue(item.tool);
      return item;
    }
    // return item
  });

  return toolList;
};

const covertTypeandCateTool3 = async (tool, stt) => {
  let doesToolTypeMatch = await stt.find((x) => x._id.toString() === tool.type);
  let tooldetail = doesToolTypeMatch;
  if (doesToolTypeMatch) {
    setToolCategory(tool, tooldetail);
    setToolType(tool, tooldetail);
  } else {
    setEmptyValue(tool);
  }
};

// For Incomplete page
const covertTypeandCateTool4 = async (data, stt) => {
  for (let r = 0; r < data.length; r++) {
    await data[r].tools.map(async (item) => {
      let covertObj = await stt.find(
        (x) => x._id.toString() === item.tool.type
      );
      if (covertObj) {
        let cate = await covertObj.categorys.find(
          (x) => x._id.toString() === item.tool.category
        );
        if (cate) {
          item.tool.category = cate.category;
        }
        item.tool.type = covertObj.type;
        return item;
      } else {
        item.tool.type = initialValue;
        item.tool.category = initialValue;
        return item;
      }
    });
  }
  return data;
};

// Sort from latest date to oldest date and Check expairation of data.
const covertHistoryBoardByCheckingDate = async (hisbs, responseData) => {
  for (var round = 0; round < hisbs.length; round++) {
    if (boardExist(hisbs[round].board)) {
      if (historyExpire(hisbs[round])) {
        await hisbs[round].remove();
      } else {
        responseData.unshift(hisbs[round]);
      }
    }
  }
};

exports.orderData = orderData;
exports.covertTypeandCateTool = covertTypeandCateTool;
exports.covertTypeandCateTool2 = covertTypeandCateTool2;
exports.covertTypeandCateTool3 = covertTypeandCateTool3;
exports.covertTypeandCateTool4 = covertTypeandCateTool4;
exports.covertHistoryBoardByCheckingDate = covertHistoryBoardByCheckingDate;

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
