import Class from "../../../models/Class.js";
import {responseObj} from "../../../util/response.js"
import mongoose from "mongoose";
const ObjectId=mongoose.Types.ObjectId
const getAll=async (req,res)=>{
    const {  search } = req.query;

    // const options = {
    //     limit,
    //     page,
    // }
console.log(req.user._id)
    const query = { teacher_id: new ObjectId(req.user._id) };

    const orConditions = [];

    let querySecond={}
    if (search!==""&&search!==null) {
       querySecond={
        name:{
            $regex:search,
            $options:"i"
        }
       }
    }

    if (orConditions.length > 0) {
        query.$or = orConditions;
    }
console.log(query)
    const students = await Class.aggregate([
        {
            $match: query
        },
       
        {
            $lookup: {
                from: 'users',
                localField: 'student_id',
                foreignField: '_id',
                as: 'user',
                pipeline: [
                    {$match:querySecond},
                    {
                        $addFields: { profile: { $concat: [process.env.CLOUD_API+"/", '$profile_image'] } }
                    },
                    {
                        $project: { name: 1, _id: 1, role: 1,profile:1 }
                    },
                ],
            },
        },
      
        {
            $addFields: {
                nonEmptyFields: {
                    $filter: {
                        input: [
                            { $arrayElemAt: ["$user", 0] },
                        ],
                        as: 'field',
                        cond: { $ne: ['$$field', []] },
                    },
                },
            },
        },
        {
            $addFields: {
                nonEmptyFields: {
                    $cond: {
                        if: { $eq: [{ $size: '$nonEmptyFields' }, 0] },
                        then: [{}], // Use an empty array if there are no non-empty fields
                        else: '$nonEmptyFields',
                    },
                },
            },
        },
        {
            $unwind: '$user'
        },
      

        {
            $replaceRoot: {
                newRoot: {
                    // student: {$mergeObjects: ["$user", { $arrayElemAt: ['$nonEmptyFields', 0] }]},
                    // counselor: '$counselor',
                    _id: { $arrayElemAt: ['$nonEmptyFields._id', 0] },
                    student: { $mergeObjects: [{ $arrayElemAt: ['$nonEmptyFields', 0] }, "$user"] },
                    teacher: req.user._id,
                },
            },
        },
      
        {
            $group: {
                _id: "$user._id",
                uniqueEntries: { $addToSet: "$$ROOT" }
            }
        },
        
     
    ]);
    const studentsTotal = await Class.aggregate([
        {
            $match: query
        },
        {
            $lookup: {
                from: 'users',
                localField: 'student_id',
                foreignField: '_id',
                as: 'user',
                pipeline: [
                    {$match:querySecond},
                    {
                        $addFields: { profile: { $concat: [process.env.APP_URL, '$profile_image'] } }
                    },
                    {
                        $project: { name: 1, _id: 1, role: 1,profile:1 }
                    },
                ],
            },
        },
       
        {
            $addFields: {
                nonEmptyFields: {
                    $filter: {
                        input: [
                            { $arrayElemAt: ["$students", 0] },
                        ],
                        as: 'field',
                        cond: { $ne: ['$$field', []] },
                    },
                },
            },
        },
        {
            $addFields: {
                nonEmptyFields: {
                    $cond: {
                        if: { $eq: [{ $size: '$nonEmptyFields' }, 0] },
                        then: [{}], // Use an empty array if there are no non-empty fields
                        else: '$nonEmptyFields',
                    },
                },
            },
        },
        {
            $unwind: '$user'
        },
        

        {
            $replaceRoot: {
                newRoot: {
                    // student: {$mergeObjects: ["$user", { $arrayElemAt: ['$nonEmptyFields', 0] }]},
                    // counselor: '$counselor',
                    _id: { $arrayElemAt: ['$nonEmptyFields._id', 0] },
                    student: { $mergeObjects: [{ $arrayElemAt: ['$nonEmptyFields', 0] }, "$user"] },
                    teacher: req.user._id,
                },
            },
        },
        {
            $group: {
                _id: "$user._id",
                uniqueEntries: { $addToSet: "$$ROOT" }
            }
        },
       
     
    ]);
    

  if(students.length===0) {
    return res.json(responseObj(true,[],"No users"));
  }
    
   let totalDocs=studentsTotal[0].uniqueEntries.length
   if (totalDocs===0) {
    return res.json(responseObj(true,[],"No users"));
}
let array=students[0].uniqueEntries
//    let totalPages=Math.ceil(totalDocs/Number(limit))
//    let hasPrevPage=page>1
//    let hasNextPage=page<totalPages
//    let prevPage=hasPrevPage?Number(page)-1:null
//    let nextPage=hasNextPage?Number(page)+1:null
    // return res.json(responseObj(true,{docs:array,totalDocs:totalDocs,limit:limit,page:page,pagingCounter:page,totalPages:totalPages,hasNextPage:hasNextPage,hasPrevPage:hasPrevPage,prevPage:prevPage,nextPage:nextPage},"All users"));
    return res.json(responseObj(true,{docs:array},"All users"));
}
 export {getAll}  