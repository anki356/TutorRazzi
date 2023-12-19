import responseObj from "../../../util/response.js"
import Class from "../../../models/Class.js"
const getAllBookings=async(req,res)=>{
    let query={status:{$in:['Scheduled','Done']}}
   if(req.query.student_id){
    query.student_id=req.query.student_id
   
   }
   if(req.query.teacher_id){
    query.teacher_id=req.query.teacher_id
   }
   if(req.query.from_date&&req.query.to_date){
    query.createdAt={
        $gte:req.query.from_date,$lt:moment(req.query.to_date).add(1,'d').format("YYYY-MM-DD")
    }
   }
   if(req.query.class_type){
    query.status=req.query.class_type
   }
   let options={
    limit:req.query.limit,
    page:req.query.page
   }
  Class.paginate(query,options,(err,result)=>{

      res.json(responseObj(true,result,"Class Response"))
  })
}