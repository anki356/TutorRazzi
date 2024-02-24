// const fs = require('fs');
// const path = require('path');
import fs from 'fs'
import path from 'path'

// const { baseUpload, tempUpload } = require("../storage/baseUploads");

function removeFile(filePath) {
    try {
        const fullPath = path.join(baseUpload, filePath);

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (error) {
        console.error(`Error deleting file '${filePath}': ${error.message}`);
    }
}

// const removeFile = async (filePath) => {
//     try {
//         const projectId = process.env.PROJECT_ID
//         const bucketName = process.env.BUCKET_NAME
//         const serviceKey = path.join(__dirname, "..", 'storageservice.json')

//         const storage = new Storage({ projectId, keyFilename: serviceKey });
//         const bucket = storage.bucket(bucketName);

//         const file = bucket.file(filePath);

//         const exists = await file.exists();
//         if (!exists[0]) {
//             console.log(`File "${filePath}" does not exist in the bucket.`);
//             return;
//         }
//         await file.delete();
//         console.log(`File "${filePath}" deleted successfully from the bucket.`);

//     } catch (error) {
//         console.log('error in file delete', error.message);
//     }
// }


function removeTemp(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error(`Error deleting file '${filePath}': ${error.message}`);
    }
}

export { removeFile, removeTemp };
