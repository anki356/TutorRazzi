import News from "../../../models/News.js"
import { responseObj } from "../../../util/response.js"
import upload from "../../../util/upload.js"

const addNews=async(req,res)=>{
    if(req.files.cover_photo){
        req.body.cover_photo=await upload(req.files.cover_photo)
          
    const newsResponse=await News.create({
        title: req.body.title,
        description:req.body.description,
        category:req.body.category,
        cover_photo:req.body.cover_photo
    })
    res.json(responseObj(true,newsResponse,"News Added"))
}
else{
    res.json(responseObj(false,null,"No cover Photo provided"))
}

    res.json(responseObj(true,newsResponse,"News Added"))
}
const editNews=async(req,res)=>{
  if(req.files.cover_photo){
req.body.cover_photo=await upload(req.files.cover_photo)
  }
  
    await News.updateOne({
        _id:req.params._id
    },{
        $set:{
            ...req.body
        }
    })
}
const getNews=async(req,res)=>{
    let query={}
    if(req.query.category){
        query.category=req.query.category
    }
    let options={
        limit:req.query.limit,
        page:req.query.page,
        select:{
            "cover_photo":1,
"title":1,
"sub_title":1,
"category":1,"_id":1
        }
    }
   News.paginate(query,options,(err,result)=>{
    return res.json(responseObj(true,result,"News"))
   })
}

export {addNews,editNews,getNews}