import Support from "../../../models/Support.js"
import { responseObj } from "../../../util/response.js"
const getAllTickets=async(req,res)=>{
    let query={
        user_id:req.user._id
    }
    if(req.query.status){
        query,status=req.query.status
    }
    let options={
        page:req.query.page,
        limit:req.query.limit
    }
   Support.paginate(query,options,(err,result)=>{
    return res.json(responseObj(true,result,"All Support Tickets"))
   })

}

const addSupport=async (req,res,next)=>{
    
    const supportResponse=await Support.insertMany({
        ticket_id:await Support.countDocuments(),
        user_id:req.user._id,
        title:req.body.title,
        description:req.body.description,
        status:"Pending",
        document_id:null,

    })
    res.json(responseObj(true,{documentResponse,supportResponse},null))
}
export {getAllTickets, addSupport}