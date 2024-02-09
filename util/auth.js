import jwt  from "jsonwebtoken";
const createJWT = (user) => {
   
   const payload = {
      user
     
      
   };
   return jwt.sign(payload, process.env.JWT_SECRET);
};
export  {createJWT}