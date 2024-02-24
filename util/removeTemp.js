import fs from 'fs'

function removeTemp(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error(`Error deleting file '${filePath}': ${error.message}`);
    }
}
export default removeTemp