import Support from "../../../models/Support.js"
import Document from "../../../models/Document.js"
import { responseObj } from "../../../util/response.js"
import SupportResponses from "../../../models/SupportResponses.js"

const addSupport=async (req,res,next)=>{
    let documentResponse
    if(req.files){
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
        document_id:req.files?documentResponse._id:null,

    })
    res.json(responseObj(true,{documentResponse,supportResponse},null))
}
const getTickets=async(req,res,next)=>{
    let options={
        limit:req.query.limit,
        page:req.query.page,
        select:{
            subject:1,status:1,createdAt:1
        }
    }
   
Support.paginate({user_id:req.user._id},options).then((result)=>{
    res.json(responseObj(true,result,"Tickets"))
})
   
}
const getTicketDetails=async(req,res)=>{
    const ticketDetails=await Support.findById({_id:req.query.ticket_id})
    const responses=await SupportResponses.find({
        support_id:req.query.ticket_id
    })
    res.json(responseObj(true,{ticketDetails:ticketDetails,responses:responses},"Ticket Details"))
}
export {addSupport,getTickets,getTicketDetails}