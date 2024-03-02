import moment from "moment"
import AcademicManager from "../../../models/AcademicManager.js"
import Class from "../../../models/Class.js"
import Student from "../../../models/Student.js"
import Support from "../../../models/Support.js"
import User from "../../../models/User.js"
import makeId from "../../../util/makeId.js"
import { responseObj } from "../../../util/response.js"
import bcrypt from 'bcrypt'
import mongoose from "mongoose"
import sendEmail from "../../../util/sendEmail.js"
import { newTeacherSignup } from "../../../util/EmailFormats/newTeacherSignup.js"
const ObjectId=mongoose.Types.ObjectId
const getTotalAcademicManager=async(req,res)=>{
     let total_academic_managers = await AcademicManager.countDocuments()
     return res.json(responseObj(false,total_academic_managers,"Total Number of Academic manager"))
}

const getAllAcademicManager=async(req,res)=>{ let users=await User.find({
    role:'academic manager'
})
let query={user_id:{
    $in:users.map((data)=>{
        return new ObjectId(data._id)
    })
}}
if(req.query.search){
    query.preferred_name={
      $regex: req.query.search,
      $options:"i"
    }
   }
let pipeline=AcademicManager.aggregate([
    {
        $match:query
    },{
        $lookup:{from:'students',
        localField:'students',
        foreignField:"user_id",
        as:"students"
    }
    }
    ,{
        $lookup:{from:'teachers',
        localField:'teachers',
        foreignField:"user_id",
        as:"teachers"
    }
    },{
        $project:{
            "preferred_name":1,
            "students_count":{
                $size:'$students'
            },
            "teachers_count":{
                $size:'$teachers'
            },
            "user_id":1
        }
    }
])
    let options={
        page:req.query.page,
        limit:req.query.limit,
        select:{
            students:1,preferred_name:1,user_id:1
        }
    }
    AcademicManager.aggregatePaginate(pipeline,options,(err,result)=>{
        console.log(err)
      return  res.json(responseObj(true,result,"All Academic Managers are"))
    })
}
const getAcademicManagerData=async(req,res)=>{
    let users=await User.find({
        status:true,
        role:'academic manager'
    })
    let academicManagers=await AcademicManager.find({
        user_id:{
            $in:users.map((data)=>data._id)
        }
    })
    let academicManagersCount=await AcademicManager.countDocuments({})
    console.log("Hello")
    let studentArray=academicManagers.map((data)=>data.students)
    console.log(studentArray)
    let studentsCount=await Student.countDocuments({
        user_id:{$in:studentArray[0]}
    })
    let upcomingClasses=await Class.countDocuments({
        status:'Scheduled',
        end_time:{
            $gte:moment().add(5,'h').add(30,'m').format("YYYY-MM-DDTHH:mm:ss")
        }
    })
    return  res.json(responseObj(true,{academicManagersCount,studentsCount,upcomingClasses},"All Academic Managers Data is"))
}
const addAcademicManager=async(req,res)=>{
    let password= await  bcrypt.hash(makeId(5), 10)
 

  let  userResponse = await User.create({
    name:req.body.name,
      email: req.body.email,
      password: password,
      mobile_number: req.body.mobile_number,
      role:"academic manager"
  })
  if(req.files){
    await User.updateOne({
        _id:userResponse._id
    },{
        $set:{
            profile_image:req.files[0].filename
        }
    })
  }

//    let degree=[
//     {name:req.body.bachelor_degree_name,
//     start_date:req.body.bachelor_degree_start_date,
//     end_date:req.body.bachelor_degree_end_date,
//     stream:req.body.bachelor_stream,
//     college:req.body.bachelor_college_name}
//    ]
//    let exp_details=[]
//    req.body.exp_detail_exp.forEach((data,index)=>{
// exp_details.push(
//     {
//         exp:data,
//         start_date:req.body.exp_detail_start_date[index],
//         end_date:req.body.exp_detail_end_date[index],
//         stream:req.body.stream[index],
//         organization:req.body.organization[index]
//        }
// )
        
     
//    })

//    if(req.body.master_degree_name){
//     degree.push({
//         name:req.body.master_degree_name,
//         start_date:req.body.master_degree_start_date,
//         end_date:req.body.master_degree_end_date,
//         stream:req.body.master_stream,
//         college:req.body.master_college_name
//     })
//    }
    const academicManager=await AcademicManager.create({
       preferred_name:req.body.name,
        user_id:userResponse._id,
        // students:req.body.students,
        // teachers:req.body.teachers,
        // city:req.body.city,
        // state:req.body.state,
        // pincode:req.body.pincode,
        // country:req.body.country,
        // address:req.body.address,
        // degree:degree,
        //  exp:req.body.exp,
        //  exp_details:exp_details,
// dob:req.body.dob,
// gender:req.body.gender,
// bank_name:req.body.bank_name,
// branch_name:req.body.branch_name,
// ifsc_code:req.body.ifsc_code,
// account_number:req.body.account_number
    })
    let content=newTeacherSignup(req.body.name,req.body.email,req.body.password)
    sendEmail(req.body.email,"New Academic Manager Sign In created",content)
    return res.json(responseObj(true,academicManager,"Academic Manager Added"))
}


const getAcademicManagerDetails=async(req,res)=>{
    let academicManagerDetails=await AcademicManager.findOne({ user_id:req.query.manager_id}).populate({
        path:'teachers'
    }).populate({
        path:'students'
    }).populate({
        path:"user_id"
    })
      if(academicManagerDetails===null) {
        throw new Error("No Aacdemic Manager Found")
      }
    let supportTicketsResolved=await Support.countDocuments({
        user_id:academicManagerDetails.user_id,
        status:"Resolved"
    })
    return res.json(responseObj(true,{academicManagerDetails:academicManagerDetails,supportTicketsResolved:supportTicketsResolved,total_students:academicManagerDetails.students.length},"Academic Manager Details"))
}

const updateManager=async (req,res)=>{
    await User.updateOne({
 _id:req.params.manager_id
    },{
       $set:{
          status:req.body.status
       }
    })
    return  res.json(responseObj(true,[],"Manager Status updated successfullly")) 
 }
 const deleteManager=async (req,res)=>{
   await User.deleteById(req.params.manager_id)
  await  AcademicManager.delete({
       user_id:req.params.manager_id
    })
    return  res.json(responseObj(true,[],"Manager deleted successfullly")) 
 }
export {getTotalAcademicManager, getAllAcademicManager, addAcademicManager, getAcademicManagerDetails, updateManager,getAcademicManagerData,deleteManager}