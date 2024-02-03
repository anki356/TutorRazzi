import fs from 'fs'
import path from 'path'
const unlinkFile=async(fileName)=>{
    
    fs.unlinkSync(path.resolve()+"/uploads/"+""+fileName)
}
export default unlinkFile