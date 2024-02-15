import Document from "../../../models/Document.js"
import Support from "../../../models/Support.js"
import SupportResponses from "../../../models/SupportResponses.js"
import { responseObj } from "../../../util/response.js"
const getAllTickets=async(req,res)=>{
    let query={
        user_id:req.user._id
    }
    if(req.query.status){
        query.status=req.query.status
    }
    let options={
        page:req.query.page,
        limit:req.query.limit
    }
   Support.paginate(query,options,(err,result)=>{
    let array=result.docs
    array.forEach(async element => {
       element.response_count=await SupportResponses.countDocuments({
is_read:false,
is_sender:false
       }) 
    });
    result.docs=array
    return res.json(responseObj(true,result,"All Support Tickets"))
   })

}

const addSupport=async (req,res,next)=>{
    let documentResponse
    if(req.files?.length>0){
         documentResponse=await Document.insertMany({
    name:req.files[0].filename
        })

    }
    const supportResponse=await Support.create({
        ticket_id:await Support.countDocuments()+1,
        user_id:req.user._id,
        subject:req.body.title,
        description:req.body.description,
        status:"Pending",
        document_id:req.files?.length>0?documentResponse._id:null,
        

    })

await SupportResponses.create({
    support_id:supportResponse._id,
    user_id:req.user._id,
    is_sender:true,
    response:req.body.description,
    
})
if(req.files?.length>0){
    await SupportResponses.create({
        support_id:supportResponse._id,
        user_id:req.user._id,
        is_sender:true,
        response_document:documentResponse._id,
        
    })
}
    res.json(responseObj(true,{documentResponse,supportResponse},null))
}
const getTicketDetails=async(req,res)=>{
    const ticketDetails=await Support.findById({_id:req.query.ticket_id})
    const responses=await SupportResponses.find({
        support_id:req.query.ticket_id
    })
    
    res.json(responseObj(true,{ticketDetails:ticketDetails,responses:responses,response_count:responses.length},"Ticket Details"))
}
const saveResponse=async(req,res)=>{
    console.log(req.files)
    const responses=await SupportResponses.create({
        user_id:req.user._id,
        support_id:req.body.support_id,
        response:req.body?.response,
        response_document:req?.files[0]?.filename,
        is_sender:true

    })
    return  res.json(responseObj(true,responses,"Response Saved Successfully"))
}

const markResolveTicket=async(req,res)=>{
    await Support.updateOne({
        _id:req.params.support_id
    },{
status:"Resolved"
    })
    const ticketDetails=await Support.findById({_id:req.params.support_id}).populate({
        path:"user_id",select:{
            name:1
        }
    })
    const responses=await SupportResponses.find({
        support_id:req.params.support_id
    }).populate({
        path:"user_id",
        select:{
            name:1
        }
    })

    return  res.json(responseObj(true,{ticketDetails:ticketDetails,responses:responses},"Ticket marked Resolved"))
}
export {getAllTickets, addSupport,getTicketDetails,saveResponse,markResolveTicket}