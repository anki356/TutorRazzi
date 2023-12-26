import Support from "../../../models/Support.js"
import Document from "../../../models/Document.js"
import { responseObj } from "../../../util/response.js"

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
        page:req.query.page
    }
   let query={}
Support.paginate(query,options,(err,result)=>{
    console.log(result)
    res.json(responseObj(true,result,"Tickets"))
})
   
}
const getTicketDetails=async(req,res)=>{
    const ticketDetails=await Support.findById({_id:req.query.ticket_id})
    res.json(responseObj(true,ticketDetails,"Ticket Details"))
}
export {addSupport,getTickets,getTicketDetails,getSupportStats}