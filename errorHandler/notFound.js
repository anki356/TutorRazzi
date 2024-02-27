import { responseObj } from "../util/response.js";

const notFound = (req,res) => {
      const response = responseObj(false,  null,"Requested Route not found",[],404);
      return res.status(404).json(response);
}
export default notFound;