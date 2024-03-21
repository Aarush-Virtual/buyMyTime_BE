const errorFunction = (errorBit, msg) => {
    return {
      success: errorBit,
      message: msg
    };
  };


  const SendResponse = (res, isSuccess, statusCode, message) => {
    return res.status(statusCode).json({
        isSuccess : isSuccess, 
        message : message
    })
  } 

  module.exports = {
    errorFunction , SendResponse
  }