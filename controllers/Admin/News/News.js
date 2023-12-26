import News from "../../../models/News.js"
import { responseObj } from "../../../util/response.js"

const addNews=async(req,res)=>{
    const newsResponse=await News.create({
        title: req.body.title,
        sub_title:req.body.sub_title,
        description:req.body.description,
        category:req.body.category,
        cover_photo:req.files[0].filename
    })
    res.json(responseObj(true,newsResponse,"News Added"))
}


export {addNews}