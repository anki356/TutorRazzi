import Document from "../../../models/Document.js"
import Support from "../../../models/Support.js"
import SupportResponses from "../../../models/SupportResponses.js"
import { responseObj } from "../../../util/response.js"

const addSupport=async (req,res,next)=>{
    if(req.files.length>0){
        documentResponse=await Document.insertMany({
   name:req.files[0].filename
       })

   }
    const supportResponse=await Support.insertMany({
        ticket_id:await Support.countDocuments()+1,
        user_id:req.user._id,
        subject:req.body.title,
        description:req.body.description,
        status:"Pending",
        document_id:req.files.length>0?documentResponse._id:null,
        category:req.body.category

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
        let query={user_id:req.user._id}
        if(req.query.status){
            query.status=req.query.status
            
        }
        let options={
            limit:req.query.limit,
            page:req.query.page
        }
       
    Support.paginate(query,options).then((result)=>{
        res.json(responseObj(true,result,"Tickets"))
    })
       
    }
    const getTicketDetails=async(req,res)=>{
        const ticketDetails=await Support.findById({_id:req.query.ticket_id})
        const responses=await SupportResponses.find({
            ticket_id:req.query.ticket_id
        })
        res.json(responseObj(true,{ticketDetails:ticketDetails,responses:responses},"Ticket Details"))
    }
    const saveResponse=async(req,res)=>{
        const responses=await SupportResponses.create({
            user_id:req.user._id,
            support_id:req.body.support_id,
            response:req.body?.response,
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
    export {getStats,getTickets,getTicketDetails,addSupport,saveResponse,markResolveTicket}