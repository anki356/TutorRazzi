const getUpcomingClasses=async(req,res,next)=>{
  
  
 
 
 
    let options={
      limit:req.query.limit?Number(req.query.limit):5,
      page:Number(req.query.page),
      populate:{
        path:'teacher_id',
        select:{'name':1}
      }
  
    }
    let query={$and:[
     { start_time :{$gte:new Date()}},
    
      {student_id:req.query.student_id},
  
    
      {status:'Scheduled'}
    ]
  
     
    }
    if(req.query.search){
      query={$and:[
        { start_time :{$gte:new Date()}},
       
         {student_id:req.user._id},
     
       
         {status:'Scheduled'},{
          $or:
            [
              { "subject.name":{
                 $regex:req.query.search,
                 $options:'i'
               }}, { "curriculum.name":{
              
                $regex:req.query.search,
                $options:'i'
              }},
              { "grade.name":{
                  
                $regex:req.query.search,
                $options:'i'
              }}
             
       
       
             ]
          
         }
       ]
     
        
       }
    }
    const classData = await Class.paginate(query,options);
    const response = responseObj(true,classData,'')
    return res.json(response);
  
  }
  const getPastClasses=async(req,res,next)=>{
   
   
    let query={$and:[
      {
  
        start_time :{$lt:new Date()},
      },{
        student_id:req.user._id,
  
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
    if(req.query.search){
      query={$and:[
        {
    
          start_time :{$lt:new Date()},
        },{
          student_id:req.query.student_id,
    
        },
        {
          status:'Done'
        },{
          $or: [
            { "subject.name":{
              
               $regex:req.query.search,
               $options:'i'
             }}
           , { "curriculum.name":{
              
            $regex:req.query.search,
            $options:'i'
          }},
          { "grade.name":{
              
            $regex:req.query.search,
            $options:'i'
          }}
        
     
     
           ]
        }
      ]
    
      }
    }
    
    
   
    Class.paginate(query,options,(err,result)=>{
      if(result){
        res.json(responseObj(true,result,'Past Class Details are here'))
      }
      throw new Error(err)
    })
   
  }

  const getClassDetails = async (req, res, next) => {
    let classDetails = {}
    classDetails = await Class.findOne({ _id: req.query.class_id }, { teacher_id:1,start_time: 1, end_time: 1, description: 1, grade: 1, subject_id: 1, notes: 1,  materials: 1,  }).populate({
        path: 'teacher_id', select: {
            profile_image: 1, name: 1
        }
    })
 let teacherResponse=await Teacher.findOne({
    user_id:classDetails.teacher_id
 },{
    exp:1,
    qualification:1
 }) 
 let reviews=await Review.countDocuments({
    teacher_id:classDetails.teacher_id
 }) 
 let average_rating=await Review.aggregate([
    {$match:{teacher_id:classDetails.teacher_id}},{
        $group:{
           _id:"$teacher_id",
           avgRating:{$avg:"$rating"}
    }}
 ])
let homeworkResponse=await HomeWork.find({
    class_id:req.query.class_id
})
let taskResponse=await Task.find({
    class_id:req.query.class_id
})

    res.json(responseObj(true, {...classDetails,homeworkResponse:homeworkResponse,taskResponse:taskResponse,teacherResponse:teacherResponse,reviews,average_rating}, "Class Details successfully fetched"))
}

  export {getPastClasses,getUpcomingClasses,getClassDetails}