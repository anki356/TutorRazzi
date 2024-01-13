import { responseObj } from "../util/response.js";

const notFound = (req,res) => {
      const response = responseObj(false,  null,"Requested Route not found",[]);
      return res.status(404).json(response);
}
export default notFound;