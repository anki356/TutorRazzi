import Support from "../../../models/Support.js"
import Document from "../../../models/Document.js"
import { responseObj } from "../../../util/response.js"
import SupportResponses from "../../../models/SupportResponses.js"
import upload from "../../../util/upload.js"
import { addNotifications } from "../../../util/addNotification.js"

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
res.json(responseObj(true,{lastTicketRaisedDate:lastTicketRaisedDate[0].createdAt,totalPendingTickets,totalResolvedTicket},"Stats"))
}
const getTickets=async(req,res,next)=>{
    let query={
       
    }
    if(req.query.status){
        query.status=req.query.status
    }
    let options={
        page:req.query.page,
        limit:req.query.limit,
        sort:{
            createdAt:-1
        }
    }
   
    let pipeline = Support.aggregate([
        {
          $match: query
        },
        {
          $lookup: {
            from: 'supportresponses',
            localField: "_id",
            foreignField: "support_id",
            as: "response",
            pipeline: [
              {
                $match: {
                  is_sender: true,
                  is_read: false
                }
              }
            ]
          }
        },
        {
          $addFields: {
            "responseLength": { $size: "$response" }
          }
        },
        {
          $project: {
            "_id": 1,
            "subject": 1,
            "createdAt": 1,
            "description": 1,
            "responseLength": 1,
            "user_id":1 ,// Include responseLength field
            "status":1,
            "ticket_id":1
          }
        }
      ]);
      
      Support.aggregatePaginate(pipeline, options, (err, result) => {

        return res.json(responseObj(true, result, "All Tickets"));
      });
   
}
const getTicketDetails=async(req,res)=>{
    const ticketDetails=await Support.findById({_id:req.query.ticket_id}).populate({
        path:'user_id',select:{
            name:1,role:1
        }
    })
    await SupportResponses.updateMany({
        support_id:req.query.ticket_id,
        is_sender:true
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
    addNotifications(ticketDetails.user_id,"Ticket marked Resolved","Ticket raised of subject of "+ticketDetails.subject+" has been mark resolved by  admin")
    return  res.json(responseObj(true,{ticketDetails:ticketDetails,responses:responses},"Ticket marked Resolved"))
}
export {addSupport,getTickets,getTicketDetails,getSupportStats,saveResponse,markResolveTicket}