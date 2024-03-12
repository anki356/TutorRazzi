import Class from "../../../models/Class.js";
import {responseObj} from "../../../util/response.js"
import mongoose from "mongoose";
const ObjectId=mongoose.Types.ObjectId
const getAll= async (req, res) => {

        const { limit, page, search } = req.query;
        const options = {
          limit,
          page,
        }
      
        const query = {};
      
        const orConditions = [];
      
        if (search) {
          orConditions.push(
            { 'student.name': { $regex: new RegExp(search, 'i') } },
            { 'teacher.name': { $regex: new RegExp(search, 'i') } },
          );
        }
      
        if (orConditions.length > 0) {
          query.$or = orConditions;
        }
      
        const counselors = Class.aggregate([
          {
            $lookup: {
              from: 'users',
              localField: 'teacher_id',
              foreignField: '_id',
              as: 'teachers',
              pipeline: [
                {
                    $addFields: { name: '$name', profile: { $concat: [process.env.CLOUD_API, '/', '$profile_image'] } }
                  },
                {
                  $project: { name: 1, profile_image: 1, _id: 1, role: 1 }
                },
              ],
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'student_id',
              foreignField: '_id',
              as: 'students',
              pipeline: [
                {
                  $addFields: { name: '$name', profile: { $concat: [process.env.CLOUD_API, '/', '$profile_image'] } }
                },
                {
                  $project: { name: 1, profile: 1 ,_id: 1, role: 1 }
                },
              ]
            },
          },
          {
            $addFields: {
              nonEmptyFields: {
                $filter: {
                  input: [
                    { $arrayElemAt: ["$teachers", 0] },
                    { $arrayElemAt: ["$students", 0] },
                    // { $arrayElemAt: ["$student", 0] },
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
            $match: query
          },
          {
            $replaceRoot: {
              newRoot:
              {
                chatUser: { $mergeObjects: [{ $arrayElemAt: ['$nonEmptyFields', 0] }, "$teachers","$students"] },

              },
            },
          },
        ]);
        Class.aggregatePaginate(counselors,options,(err,result)=>{
            if(result){
                if(result.totalDocs===0){
                    return res.json(responseObj(false,null,"No users"));
                }
            }
            return res.json(responseObj(true,result,"All users"));
        })  
       
}
 export {getAll}  