import {responseObj} from "../../../util/response.js"
import Class from "../../../models/Class.js"
import User from "../../../models/User.js"
const getUpcomingClasses=async(req,res,next)=>{
  
  
 
 
 
    let options={
      limit:req.query.limit?Number(req.query.limit):5,
      page:Number(req.query.page),
      populate:{
        path:'teacher_id',
        select:{'name':1}
      },
  sort:{
start_time:1
  }
    }
    let query={$and:[
     { end_time :{$gte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")}},
    
    //   {student_id:req.user._id},
  
    
      {status:'Scheduled'}
    ]
  
     
    }
    if(req.query.search) {
      let student_ids=await User.find({
        name:{
          $regex: req.query.search, $options: 'i' 
        }
        })
        let teacher_ids=await User.find({
          name:{
            $regex: req.query.search, $options: 'i'
          }
        })
      query["$or"] = [
       
        { "subject.name": { $regex: req.query.search, $options: 'i' } },
        {"name":  {$regex: req.query.search, $options: 'i' }
         
        },
        {"student_id":{
          $in:student_ids.map((data)=>data._id)
        }},
        {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
      ];
    }
    const classData = await Class.paginate(query,options);
    const response = responseObj(true,classData,'')
    return res.json(response);
  
  }
  const getPastClasses=async(req,res,next)=>{
   
   
    let query={$and:[
      {
  
        start_time :{$lt:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")},
      },{
        // student_id:req.user._id,
  
      },
      {
        status:'Done'
      }
    ]
  
    }
    let options={
      limit:req.query.limit?Number(req.query.limit):5,
      page:Number(req.query.page),
      populate:{
        path:'teacher_id',
        select:{
          "name":1
        }
      }
    }
    if(req.query.search) {
      let student_ids=await User.find({
        name:{
          $regex: req.query.search, $options: 'i' 
        }
        })
        let teacher_ids=await User.find({
          name:{
            $regex: req.query.search, $options: 'i'
          }
        })
      query["$or"] = [
       
        { "subject.name": { $regex: req.query.search, $options: 'i' } },
        {"name":  {$regex: req.query.search, $options: 'i' }
         
        },
        {"student_id":{
          $in:student_ids.map((data)=>data._id)
        }},
        {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
      ];
    }
    
    
   
    Class.paginate(query,options,(err,result)=>{
      if(result){
        res.json(responseObj(true,result,'Past Class Details are here'))
      }
     
    })
   
  }

  const getTrialClasses=async(req,res,next)=>{
 
    let query={$and:[{
    //   student_id:req.user._id,
      class_type:'Trial',
      end_time:{
        "$gte":moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
      },
      status:{
        $ne:"Cancelled"
      }
    }]}
    if(req.query.search) {
      let student_ids=await User.find({
        name:{
          $regex: req.query.search, $options: 'i' 
        }
        })
        let teacher_ids=await User.find({
          name:{
            $regex: req.query.search, $options: 'i'
          }
        })
      query["$or"] = [
       
        { "subject.name": { $regex: req.query.search, $options: 'i' } },
        {"name":  {$regex: req.query.search, $options: 'i' }
         
        },
        {"student_id":{
          $in:student_ids.map((data)=>data._id)
        }},
        {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
      ];
    }
    let options={
      limit:req.query.limit?Number(req.query.limit):5,
      page:Number(req.query.page),
      populate:{
        path:"teacher_id",
        select:{
          name:1
        }
      }
    }
    Class.paginate(query,options,(err,result)=>{
      res.json(responseObj(true,result,''))
    })
  }
  const getRescheduledClasses=async(req,res,next)=>{
 


    let options={
        limit:req.query.limit?Number(req.query.limit):5,
        page:Number(req.query.page),
        populate:{
          "path":"teacher_id",
          select:{
            "name":1
          }
        }
    
      }
      let query={$and:[
            {
    
              end_time :{$gte:new Date().toLocaleDateString()},
            },{
            //   student_id:req.user._id,
    
            },
            {
              is_rescheduled:true
            },{
              status:"Pending"
            }]
          }
          if(req.query.search) {
            let student_ids=await User.find({
              name:{
                $regex: req.query.search, $options: 'i' 
              }
              })
              let teacher_ids=await User.find({
                name:{
                  $regex: req.query.search, $options: 'i'
                }
              })
            query["$or"] = [
             
              { "subject.name": { $regex: req.query.search, $options: 'i' } },
              {"name":  {$regex: req.query.search, $options: 'i' }
               
              },
              {"student_id":{
                $in:student_ids.map((data)=>data._id)
              }},
              {"teacher_id":{$in:teacher_ids.map((data)=>data._id)}}
            ];
          }
        Class.paginate(query,options,(err,result)=>{
          if(result){
            res.json(responseObj(true,result,'Rescheduled Classes are'))
          }
          else{
            console.log(err)
          }
        })
    }
    export {getUpcomingClasses,getPastClasses,getRescheduledClasses,getTrialClasses}
