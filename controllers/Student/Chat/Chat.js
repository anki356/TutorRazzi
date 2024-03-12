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
console.log(req.user._id)
    const query = { student_id: new ObjectId(req.user._id) };

    const orConditions = [];

    if (search) {
        orConditions.push(
            { 'teacher_id.name': { $regex: search,$options:"i"  } },
        );
    }

    if (orConditions.length > 0) {
        query.$or = orConditions;
    }

    const teachers =  Class.aggregate([
        {
                $match: query
            },
        {
            $lookup: {
                from: 'users',
                localField: 'taecher_id',
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
    // const studentsTotal = await Class.aggregate([
    //     {
    //             $match: query
    //         },
    //     {
    //         $lookup: {
    //             from: 'users',
    //             localField: 'student_id',
    //             foreignField: '_id',
    //             as: 'user',
    //             pipeline: [
    //                 {
    //                     $addFields: { profile: { $concat: [process.env.APP_URL, '$profile_image'] } }
    //                 },
    //                 {
    //                     $project: { name: 1, _id: 1, role: 1,profile:1 }
    //                 },
    //             ],
    //         },
    //     },
       
    //     {
    //         $addFields: {
    //             nonEmptyFields: {
    //                 $filter: {
    //                     input: [
    //                         { $arrayElemAt: ["$students", 0] },
    //                     ],
    //                     as: 'field',
    //                     cond: { $ne: ['$$field', []] },
    //                 },
    //             },
    //         },
    //     },
    //     {
    //         $addFields: {
    //             nonEmptyFields: {
    //                 $cond: {
    //                     if: { $eq: [{ $size: '$nonEmptyFields' }, 0] },
    //                     then: [{}], // Use an empty array if there are no non-empty fields
    //                     else: '$nonEmptyFields',
    //                 },
    //             },
    //         },
    //     },
    //     {
    //         $unwind: '$user'
    //     },
        

    //     {
    //         $replaceRoot: {
    //             newRoot: {
    //                 // student: {$mergeObjects: ["$user", { $arrayElemAt: ['$nonEmptyFields', 0] }]},
    //                 // counselor: '$counselor',
    //                 _id: { $arrayElemAt: ['$nonEmptyFields._id', 0] },
    //                 student: { $mergeObjects: [{ $arrayElemAt: ['$nonEmptyFields', 0] }, "$user"] },
    //                 teacher: req.user._id,
    //             },
    //         },
    //     },
    //     {
    //         $group: {
    //             _id: "$user._id",
    //             uniqueEntries: { $addToSet: "$$ROOT" }
    //         }
    //     },
       
     
    // ]);
    Class.aggregatePaginate(students,options,(err,result)=>{
        if(result){
            if(result.totalDocs===0){
                return res.json(responseObj(false,null,"No users"));
            }
        }
        return res.json(responseObj(true,result,"All users"));
    })  

   }
 export {getAll}  