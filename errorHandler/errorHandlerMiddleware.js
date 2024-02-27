import { responseObj } from "../util/response.js"
import { getReasonPhrase, StatusCodes, ReasonPhrases } from  "http-status-codes"

const errorHandlerMiddleware = (error, req, res, next) => {

    console.log("__________error______________", error.name);
    if (error.name === 'ValidationError') {
        const response = responseObj(false,  null,"ValidationError",error,StatusCodes.OK);
        return res.status(StatusCodes.OK).json(response);
    }

    if (error.name === 'ReferenceError') {
      const response = responseObj(false,null,"Reference Error",error,StatusCodes.OK);
        return res.status(StatusCodes.OK).json(response);
    }

    if (error.name === 'MongoServerError' && error.code === 11000) {
      const response = responseObj(false,  null,'Duplicate Entry',error,StatusCodes.OK);
      
        return res.status(StatusCodes.OK).json(response);
    }

    if (error) {
      const response = responseObj(false,  null,error.message,error,StatusCodes.OK);
        return res.status(StatusCodes.OK).json(response);
    }
    next();
}
export default errorHandlerMiddleware