import jwt  from "jsonwebtoken";
const createJWT = (email) => {
   
   const payload = {
      email,
     
      
   };
   return jwt.sign(payload, process.env.JWT_SECRET);
};
export  {createJWT}