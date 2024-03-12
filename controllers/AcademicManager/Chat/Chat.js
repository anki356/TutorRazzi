import AcademicManager from "../../../models/AcademicManager.js";
import Class from "../../../models/Class.js";
import {responseObj} from "../../../util/response.js"
import mongoose from "mongoose";
const ObjectId=mongoose.Types.ObjectId
const getAll=async (req,res)=>{
    const { limit, page, search } = req.query;

    const options = {
        limit,
        page,
    }

    let query={
        user_id:new ObjectId(req.user._id)
    }

    const orConditions = [];

    if (search) {
        orConditions.push(
            { 'students.name': { $regex: search,$options:"i" } },
            { 'teachers.name': { $regex: search,$options:"i" } },
        );
    }

    if (orConditions.length > 0) {
        query.$or = orConditions;
    }
console.log(query)
    const students = AcademicManager.aggregate([
       
        {
            $lookup: {
                from: 'users',
                localField: 'students',
                foreignField: '_id',
                as: 'user',
                pipeline: [
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
            $lookup: {
                from: 'users',
                localField: 'teachers',
                foreignField: '_id',
                as: 'teachers',
                pipeline: [
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
                            {$arrayElemAt: ["$teachers", 0]}
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
teacher:{$mergeObjects: [{ $arrayElemAt: ['$nonEmptyFields', 0] }, "$teachers"]},
                    academic_manager: req.user._id,
                },
            },
        },
        {
            $skip: (Number(page) - 1) * Number(limit)
        },
        {
            $limit:Number(limit)
        },
        {
            $match: query
        },
        {
            $group: {
                _id: "$user._id",
                uniqueEntries: { $addToSet: "$$ROOT" }
            }
        },
        
     
    ]);
    const studentsTotal =await AcademicManager.aggregate([
       
    {
        $lookup: {
            from: 'users',
            localField: 'students',
            foreignField: '_id',
            as: 'user',
            pipeline: [
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
        $lookup: {
            from: 'users',
            localField: 'teachers',
            foreignField: '_id',
            as: 'teachers',
            pipeline: [
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
                        {$arrayElemAt: ["$teachers", 0]}
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
teacher:{$mergeObjects: [{ $arrayElemAt: ['$nonEmptyFields', 0] }, "$teachers"]},
                academic_manager: req.user._id,
            },
        },
    },
    {
        $match: query
    },
    {
        $group: {
            _id: "$user._id",
            uniqueEntries: { $addToSet: "$$ROOT" }
        }
    },
    
 
]);
    

   
let totalDocs=studentsTotal[0].uniqueEntries.length
if (totalDocs===0) {
 return res.json(responseObj(true,[],"No users"));
}
let totalPages=Math.ceil(totalDocs/Number(limit))
let hasPrevPage=page>1
let hasNextPage=page<totalPages
let prevPage=hasPrevPage?Number(page)-1:null
let nextPage=hasNextPage?Number(page)+1:null
 return res.json(responseObj(true,{docs:students[0].uniqueEntries,totalDocs:totalDocs,limit:limit,page:page,pagingCounter:page,totalPages:totalPages,hasNextPage:hasNextPage,hasPrevPage:hasPrevPage,prevPage:prevPage,nextPage:nextPage},"All users"));

}
 export {getAll}  