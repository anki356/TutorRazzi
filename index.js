
import express from "express";
const app = express();
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
const server = http.createServer(app);
import dotenv from "dotenv";
import nodeCron from 'node-cron'

dotenv.config({ path: `.env.${process.env.NODE_ENV?.trim()}` });



const router=express.Router()
app.use(upload.any())
 app.use(
    express.json({  limit: "500mb" })
  );
  app.use(express.urlencoded({extended: true, parameterLimit: 100000}))
 app.use(cors());
 
 app.use("/",router)
 app.use(express.static('uploads'))
 
import "express-async-errors";
import errorHandlerMiddleware from "./errorHandler/errorHandlerMiddleware.js"
import notFound from "./errorHandler/notFound.js";
import StudentRouter from "./Routes/Student/index.js"
import AdminRouter from "./Routes/Admin/index.js"
import ParentRouter from "./Routes/Parent/index.js"
import TeacherAppRouter from "./Routes/TeacherApp/index.js"
import AcademicManagerRouter from "./Routes/AcademicManager/index.js"
import TeacherDashboardRouter from "./Routes/TeacherDashboard/index.js"
import WebsiteRouter from "./Routes/Website/index.js"
import HomeWork from "./models/HomeWork.js";
import upload from "./util/upload.js";
app.use("/api/",StudentRouter)
app.use("/api/",AdminRouter)
app.use("/api/",ParentRouter)
app.use("/api/",TeacherAppRouter)
app.use("/api/",AcademicManagerRouter)
app.use("/api/",TeacherDashboardRouter)
app.use("/api/",WebsiteRouter)
app.use(errorHandlerMiddleware);
app.use(notFound);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.get('/reset-password/:token', (req, res) => {
  const token = req.params.token;
  return res.render('reset-password', { token, errorMessage: null });
});
 const start = async () => {

    try {
     await mongoose.connect(process.env.DB_URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }, { timestamps: true });
      const port = process.env.PORT || 5000;
      const urlHost = process.env.APP_URL;
  
      server.listen(port, () => console.log(`server is listening at ${urlHost}`));
    } catch (error) {
      console.log(error);
    }
  };
  
  start();
  nodeCron.schedule('0 0 * * *', async () => {
    const currentDate = new Date();
  await HomeWork.updateMany({
    due_date:{$lt:currentDate},
    expires:true
  })
  });


