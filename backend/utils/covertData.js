const orderData = (data) => {
    let responseData = []
      for (var round = 0; round < data.length; round++) {
          let index = data.length - 1 - round
          responseData = [...responseData, data[index]]
      }
      return responseData
  }

exports.orderData = orderData;