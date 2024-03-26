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
  const USER_TYPES = {
    CUSTOMER : "customer",
    SERVICEPROVIDER : "serviceProvider",
    ADMIN : "admin"
  }

  module.exports = {
    errorFunction , SendResponse , USER_TYPES
  }