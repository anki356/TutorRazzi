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
        student_id: req.query.student_id,
        teacher_id: req.user._id,
        subject: req.query.subject
    }
    let pipeline=MonthlyReport.aggregate([
        {$match:{
            student_id: new ObjectID(req.query.student_id),
        teacher_id: new ObjectID(req.user._id),
        subject: req.query.subject  
        }},
        {$project:{
            averageRating: {$round:[{$avg: "$reports.rating"},0] },
            status:1,
            month: { $arrayElemAt: [months, {$add:["$month",1]}] },
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

const addMonthlyReport = async (req, res) => {
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
    const monthlyReport = await MonthlyReport.findOne({
        _id:req.body.monthly_report_id
    })

    // You can use other accumulator operators based on your requirements


    if (monthlyReport !== null) {


        let array = [
            {
                title: "Academic Performance",
                sub_title: "Subject Knowledge and Understanding",
                rating: req.body.subject_knowledge_and_understanding,
                message: req.body.subject_knowledge_and_understanding_message,
            },
            {
                title: "Academic Performance",
                sub_title: "Class Participation and Engagement",
                rating: req.body.class_participation_and_engagement,
                message: req.body.class_participation_and_engagement_message,
            },
            {
                title: "Academic Performance",
                sub_title: "Homework and Assignments Completion",
                rating: req.body.homeworks_and_assignment_completion,

                message: req.body.homeworks_and_assignment_completion_message,
            }, {
                title: "Academic Performance",
                sub_title: "Problem-Solving and Critical Thinking Skills",
                rating: req.body.problem_solving_and_critical_thinking_skills,
                // status:true,

                message: req.body.problem_solving_and_critical_thinking_skills_message,
            }, {
                title: "Learning Attitude",
                sub_title: "Motivation and Enthusiasm",
                rating: req.body.motivation_and_enthusiasm,
                // status:true,
                message: req.body.motivation_and_enthusiasm_message,
            }, {
                title: "Learning Attitude",
                sub_title: "Initiative and Self Direction",
                rating: req.body.initiative_and_self_direction,
                // status:true,
                message: req.body.initiative_and_self_direction_message,
            }, {
                title: "Learning Attitude",
                sub_title: "Collaboration and Teamwork",
                rating: req.body.collaboration_and_teamwork,
                // status:true,
                message: req.body.collaboration_and_teamwork_message,
            }, {
                title: "Communication Skills",
                sub_title: "Verbal Communication",
                rating: req.body.verbal_communication,
                // status:true,
                message: req.body.verbal_communication_message,
            }, {
                title: "Communication Skills",
                sub_title: "Written Communication",
                rating: req.body.written_communication,
                // status:true,
                message: req.body.written_communication_message,
            }, {
                title: "Personal Growth",
                sub_title: "Time Management",
                rating: req.body.time_management,
                // status:true,
                message: req.body.time_management_message,
            },{
                title:"Personal Growth",
                sub_title:"Organization and Preparedness",
                rating:req.body.organization_and_preparedness,
                // status:true,
                message:req.body.organization_and_preparedness_message,
            },{
                title:"Personal Growth",
                sub_title:"Responsibility and Accountability",
               
                    rating:req.body.responsibility_and_accountability,
                    // status:true,
                    message:req.body.responsibility_and_accountability_message
                
            }
        ]

        const report = await MonthlyReport.updateOne({

            _id:req.body.monthly_report_id

        }, {
            $set: {
status:"Done",
reports:array
            }
        })
    
      
      
       





        const additionalComment = await AdditionalComment.create({
            student_id: monthlyReport.student_id,
            comments: req.body.comments,
            month: monthlyReport.month,
            year: monthlyReport.year,
            teacher_id: req.user._id
        })
        addNotifications(monthlyReport.student_id, "Report Filled", "Your  monthly for "+months[monthlyReport.month] +", "+monthlyReport.year+ " report has been filled for " + req.body.subject + " by teacher " + req.user.name)



        // addNotifications(,"Task Added", "A Task has been added by "+req.user.name+" of title"+ req.body.title)






        return res.json(responseObj(true, null, "Student Report Added"))
    }
    else {
        return res.json(responseObj(false, null, "Student Report already added or class not found"))
    }
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
        student_id: reportDetails.student_id, month: reportDetails.month,
        year: reportDetails.year, teacher_id: req.user._id
    })
    res.json(responseObj(true, { ratings: averageGrade[0]?.averageRating ? averageGrade[0]?.averageRating : 0, report: reportDetails.reports, additionalComment: additionalComment }, null))
}
const isStudentReportPending = async (req, res) => {

    let classResponse = await Class.find({
        student_id: req.query.student_id,
        teacher_id: req.user._id,
        start_time: {
            $gte: moment().startOf('month').format("YYYY-MM-DDTHH:mm:ss"),
            $lte: moment().endOf('month').format("YYYY-MM-DDTHH:mm:ss")
        },
        status: 'Done',
        "subject.name": req.query.subject

    })

    if (classResponse.length === 0) {
        return res.json(responseObj(true, classResponse, "No Class Found"))
    }
    let isPendingResponse = await Report.find({
        student_id: req.query.student_id,
        teacher_id: req.user._id,
        month: moment().month(),
        year: moment().year(),
        subject: { $in: classResponse.map((data) => data.subject.name) }
    })

    return res.json(responseObj(true, isPendingResponse.length === 0, null))
}
const getAllSubjects = async (req, res) => {
    let subjects = await Class.find({
        teacher_id: req.user._id,
        student_id: req.query.student_id,
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
export { getMonthlyReport, addMonthlyReport, getMonthlyReportDetails, isStudentReportPending, getAllSubjects }
