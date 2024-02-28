import Support from "../../../models/Support.js"
import Document from "../../../models/Document.js"
import { responseObj } from "../../../util/response.js"
import SupportResponses from "../../../models/SupportResponses.js"

const addSupport=async (req,res,next)=>{
    const documentResponse=await Document.insertMany({
name:req.files[0].filename
    })
    const supportResponse=await Support.insertMany({
        ticket_id:await Support.countDocuments(),
        user_id:req.user._id,
        title:req.body.title,
        description:req.body.description,
        status:"Pending",
        document_id:documentResponse._id,

    })
    res.json(responseObj(true,{documentResponse,supportResponse},null))
}
const getSupportStats=async(req,res)=>{
const lastTicketRaisedDate=await Support.find({},{createdAt:1}).sort({createdAt:-1}).limit(1)
const totalPendingTickets=await Support.countDocuments({
    status:'Pending'
})
const totalResolvedTicket=await Support.countDocuments({
    status:'Resolved'
})
res.json(responseObj(true,{lastTicketRaisedDate,totalPendingTickets,totalResolvedTicket},"Stats"))
}
const getTickets=async(req,res,next)=>{
    let options={
        limit:req.query.limit,
        page:req.query.page,
        sort:{
            createdAt:-1
        }
    }
   let query={}
Support.paginate(query,options,(err,result)=>{
    console.log(result)
    res.json(responseObj(true,result,"Tickets"))
})
   
}
const getTicketDetails=async(req,res)=>{
    const ticketDetails=await Support.findById({_id:req.query.ticket_id})
    await SupportResponses.updateMany({
        support_id:req.query.ticket_id
    },{$set:{
        is_read:true
    }
        
    })
    const responses=await SupportResponses.find({
        support_id:req.query.ticket_id
    })
    res.json(responseObj(true,{ticketDetails:ticketDetails,responses:responses,response_count:responses.length},"Ticket Details"))
}
const saveResponse=async(req,res)=>{
    let fileName
    if(req.files?.attachment){
      fileName=await upload(req.files.attachment)
         
  
    }
      const responses=await SupportResponses.create({
          user_id:req.user._id,
          support_id:req.body.support_id,
          response:req.body?.response,
          response_document:req.files?.attachment?fileName:null,
          is_sender:false
  
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
export {addSupport,getTickets,getTicketDetails,getSupportStats,saveResponse,markResolveTicket}