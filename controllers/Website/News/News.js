import News from "../../../models/News"
import { responseObj } from "../../../util/response"

const getNews=async(req,res)=>{
    let query={}
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
    return res.json(true,result,"News")
   })
}

const getNewsById=async(req,res)=>{
    const news=await News.findById(req.query.news_id)
    return res.json(responseObj(true,news,"News Details"))
}
export {getNews,getNewsById}