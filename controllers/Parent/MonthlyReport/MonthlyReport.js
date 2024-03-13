import Grade from "../../../models/Grade.js"
import mongoose from "mongoose"
import { responseObj } from "../../../util/response.js"
import AdditionalComment from "../../../models/AdditionalComment.js"
import moment from "moment"
import Report from "../../../models/Report.js"
import Class from "../../../models/Class.js"
import { addNotifications } from "../../../util/addNotification.js"
import MonthlyReport from "../../../models/MonthlyReport.js"
const ObjectID = mongoose.Types.ObjectId
const getMonthlyReport = async (req, res, next) => {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    let query = {
        student_id: req.user._id,
        subject: req.query.subject
    }
    let pipeline=MonthlyReport.aggregate([
        {$match:{
            student_id: new ObjectID(req.user._id),
        // teacher_id: new ObjectID(req.user._id),
        subject: req.query.subject  
        }},
        {$project:{
            averageRating: {$round:[{$avg: "$reports.rating"},0] },
            status:1,
            month:1,
            year:1,

        }}
    ])
    let options = {
        limit: req.query.limit,
        page: req.query.page
    }
    MonthlyReport.aggregatePaginate(pipeline, options, (err, result) => {
        return res.json(responseObj(true, result, null))

    })

}


const getMonthlyReportDetails = async (req, res) => {
    const averageGrade = await MonthlyReport.aggregate([
        {
            $match: {
                _id:new ObjectID(req.query.id)

            }
        }
        ,
        {$project:{
            averageRating: {$round:[{$avg: "$reports.rating"},2] }

        }}
       
    ])

    const reportDetails = await MonthlyReport.findOne({
       _id:req.query.id
    })
    if(reportDetails===null){
        throw new Error("Invalid Report Id")
    }
    const additionalComment = await AdditionalComment.findOne({
        student_id: req.user._id, month: reportDetails.month,
        year: reportDetails.year, teacher_id: reportDetails.teacher_id
    })
    res.json(responseObj(true, { ratings: averageGrade[0]?.averageRating ? averageGrade[0]?.averageRating : 0, report: reportDetails.reports, additionalComment: additionalComment }, null))
}

const getAllSubjects = async (req, res) => {
    let subjects = await Class.find({
        // teacher_id: ,
        student_id: req.user._id,
        status: "Done"
    }, {
        subject: 1
    })
    subjects = subjects.map((data) => {
        return data.subject.name
    }).filter((data, index, self) => {
        return self.indexOf(data) === index
    })
    return res.json(responseObj(true, subjects, "subjects"))

}
export { getMonthlyReport, getMonthlyReportDetails, getAllSubjects }
