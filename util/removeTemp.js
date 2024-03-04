import fs from 'fs'
import path from 'path'
import { Storage } from '@google-cloud/storage'
async function removeTemp(filePath) {
    try {
        const projectId = process.env.PROJECT_ID
        const bucketName = process.env.BUCKET_NAME
        const serviceKey = path.join(path.resolve(),  'storageservice.json')

        const storage = new Storage({ projectId, keyFilename: serviceKey });
        const bucket = storage.bucket(bucketName);

        const file = bucket.file(filePath);

        const exists = await file.exists();
       
        if (exists) {
            await file.delete();
        }
    } catch (error) {
        console.error(`Error deleting file '${filePath}': ${error.message}`);
    }
}
export default removeTemp