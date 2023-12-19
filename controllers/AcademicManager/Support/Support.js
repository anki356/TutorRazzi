import Support from "../../../models/Support.js"
import { responseObj } from "../../../util/response.js"

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
        let query={}
        if(req.query.status){
            query={
                status:req.query.status
            }
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
        res.json(responseObj(true,ticketDetails,"Ticket Details"))
    }
    export {getStats,getTickets,getTicketDetails}