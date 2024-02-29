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
    const query = { teacher_id: new ObjectId(req.user._id) };

    const orConditions = [];

    if (search) {
        orConditions.push(
            { 'student_id.name': { $regex: search,$options:"i"  } },
        );
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
            $skip: (Number(page) - 1) * Number(limit)
        },
        {
            $limit:Number(limit)
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
    

    if (!students.length>0) {
        return res.json(responseObj(true,[],"No users"));
    }
    
   let totalDocs=students[0].uniqueEntries.length
   let totalPages=Math.ceil(totalDocs/Number(limit))
   let hasPrevPage=page>1
   let hasNextPage=page<totalPages
   let prevPage=hasPrevPage?Number(page)-1:null
   let nextPage=hasNextPage?Number(page)+1:null
    return res.json(responseObj(true,{docs:students[0].uniqueEntries,totalDocs:totalDocs,limit:limit,page:page,pagingCounter:page,totalPages:totalPages,hasNextPage:hasNextPage,hasPrevPage:hasPrevPage,prevPage:prevPage,nextPage:nextPage},"All users"));
}
 export {getAll}  