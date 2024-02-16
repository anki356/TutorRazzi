import Support from "../../../models/Support.js"
import Document from "../../../models/Document.js"
import { responseObj } from "../../../util/response.js"
import SupportResponses from "../../../models/SupportResponses.js"
import mongoose from "mongoose"
const ObjectId=mongoose.Types.ObjectId
const addSupport=async (req,res,next)=>{
    let documentResponse
    console.log(req.files)
    if(req.files.length>0){

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
category:req.body.category
    })
    await SupportResponses.create({
        support_id:supportResponse._id,
        user_id:req.user._id,
        is_sender:true,
        response:req.body.description,
        response_document:req.files?.length>0?req.files[0].filename:null,
        
    })
  
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
let options={
    page:req.query.page,
    limit:req.query.limit
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
      "status":1
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
        support_id:req.query.ticket_id
    },{$set:{
        is_read:true
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
    const responses=await SupportResponses.create({
        user_id:req.user._id,
        support_id:req.body.support_id,
        response:req.body?.response?req.body.response:null,
        response_document:req.files[0].filename,
        is_sender:true,

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
export {addSupport,getTickets,getTicketDetails,getStats,saveResponse,markResolveTicket}