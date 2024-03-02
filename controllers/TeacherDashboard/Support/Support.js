import Support from "../../../models/Support.js"
import Document from "../../../models/Document.js"
import { responseObj } from "../../../util/response.js"
import SupportResponses from "../../../models/SupportResponses.js"
import mongoose from "mongoose"
import upload from "../../../util/upload.js"
import { addNotifications } from "../../../util/addNotification.js"
const ObjectId=mongoose.Types.ObjectId
const addSupport=async (req,res,next)=>{
    let documentResponse
    let fileName
    if(req.files?.file){
     fileName =await upload(req.files.file)
         documentResponse=await Document.create({
    name:fileName
        })

    }
    const supportResponse=await Support.create({
        ticket_id:await Support.countDocuments()+1,
        user_id:req.user._id,
        subject:req.body.title,
        description:req.body.description,
        status:"Pending",
        document_id:req.files?.file?documentResponse._id:null,
        

    })

    await SupportResponses.create({
        support_id:supportResponse._id,
        user_id:req.user._id,
        is_sender:true,
        response:req.body.description,
        response_document:req.files?.file?fileName:null,
        
    })
    addNotifications("65891c1d69765570ec7d213a","Ticket raised","Ticket raised of subject of "+req.body.title+" by "+req.user.name)
    res.json(responseObj(true,{documentResponse,supportResponse},null))
}
const getStats=async(req,res)=>{
const lastTicketRaisedDate=await Support.find({user_id:req.user._id},{createdAt:1}).sort({createdAt:-1}).limit(1)
const totalPendingTickets=await Support.countDocuments({
    user_id:req.user._id,
    status:'Pending'
})
const totalResolvedTicket=await Support.countDocuments({
    user_id:req.user._id,
    status:'Resolved'
})
res.json(responseObj(true,{lastTicketRaisedDate,totalPendingTickets,totalResolvedTicket},"Stats"))
}
const getTickets=async(req,res,next)=>{
    let query={

        user_id:new ObjectId(req.user._id)
    }

if(req.query.status){
    query.status=req.query.status
}
if(req.query.search){
  query.subject={
    $regex:req.query.search,
    $options:"i"
  }
}
let options={
    page:req.query.page,
    limit:req.query.limit,
    sort:{
createdAt:-1
    }
}
console.log(query)
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
              is_sender: false,
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
        "user_id":1, // Include responseLength field
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
        path:"user_id",select:{
            name:1
        }
    })
    await SupportResponses.updateMany({
        support_id:req.query.ticket_id,
        is_sender:false
    },{$set:{
        is_read:true,

    }
        
    })
    const responses=await SupportResponses.find({
        support_id:req.query.ticket_id
    }).populate({
        path:"user_id",
        select:{
            name:1
        }
    })
  return  res.json(responseObj(true,{ticketDetails:ticketDetails,responses:responses},"Ticket Details"))
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
    addNotifications("65891c1d69765570ec7d213a","Ticket marked Resolved","Ticket raised of subject of "+ticketDetails.subject+" has been mark resolved by  "+req.user.name)
    return  res.json(responseObj(true,{ticketDetails:ticketDetails,responses:responses},"Ticket marked Resolved"))
}
export {addSupport,getTickets,getTicketDetails,getStats,saveResponse,markResolveTicket}