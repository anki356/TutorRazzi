// import multer from "multer";

// import path from "path";
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './uploads/')
//     },
//     filename: function (req, file, cb) {
//       const ext = path.extname(file.originalname);
//       cb(null, file.fieldname.replace("[]",'') + '-' + Date.now()+ ext)
//     }
//   });
//   const upload = multer({ storage: storage });
//   export default upload
// // import baseUploads from "../storage/baseUploads.js";


// // const upload = (files) => {
// //     const uploadPath = baseUploads + files.name;
   
// //     files.mv(uploadPath)
// //     return files.name;
// // }


// const { baseUpload } = require("../storage/baseUploads");
// const { Storage } = require('@google-cloud/storage');
// const path = require("path");
// const { removeTemp } = require("./removeFile");
// const slugify = require("slugify");
import slugify from "slugify"
import removeTemp from "./removeTemp.js"
import path from "path"
import { Storage } from "@google-cloud/storage"
import baseUploads from "../storage/baseUploads.js"
const upload = async (files) => {
    try {
        const projectId = process.env.PROJECT_ID
        const bucketName = process.env.BUCKET_NAME
        const serviceKey = path.join(path.resolve(),  'storageservice.json')
        const storage = new Storage({ projectId, keyFilename: serviceKey });

        const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('.', '');
        const filenameUnique = `${timestamp}-${slugify(files.name, { trim: true, lower: true })}`
        const uploadPath = await storage.bucket(bucketName).upload(files.tempFilePath, {
            destination: filenameUnique
        })

        if (uploadPath) {
            removeTemp(files.tempFilePath)
        }

        // const uploadPath = baseUpload + files.name;
        // files.mv(uploadPath)
        
        return filenameUnique;

    } catch (error) {
        console.log('error in file upload', error.message);
    }
}


export { upload }