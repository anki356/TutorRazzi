import User from "../../../models/User.js";
import { responseObj } from "../../../util/response.js";

const getAllRoles=async(req,res)=>{
    let query={role:'admin'}
    let options={
        limit:req.query.limit,
        page:req.query.page
    }
    User.paginate(query,options,(err,result)=>{
        return res.json(responseObj(true,result,"All Admin roles are"))

    });

}

const getRoleDetails=async(req,res)=>{
    const roleData=await User.findOne({
        _id:req.query._id
    })
    return res.json(responseObj(true,roleData,"Role Details"))
}

const deleteUser=async(req,res)=>{
    await User.updateOne({
        _id:req.params._id
    },{
        $set:{
            status:false
        }
    })
    return res.json(responseObj(true,[],'User is deleted'))
}

export {getAllRoles,getRoleDetails, deleteUser}