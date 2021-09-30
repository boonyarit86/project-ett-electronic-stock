const orderData = (data) => {
    let responseData = []
      for (var round = 0; round < data.length; round++) {
          let index = data.length - 1 - round
          responseData = [...responseData, data[index]]
      }
      return responseData
  }

  const covertTypeandCateTool2 = async (tools, stt) => {
    let arrTool = await tools.map((item) => {
      let data = stt.find((x) => x._id.toString() === item.tool.type);
      if (data) {
        let cate = data.categorys.find((x) => x._id.toString() === item.tool.category);
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

exports.orderData = orderData;
exports.covertTypeandCateTool2 = covertTypeandCateTool2;