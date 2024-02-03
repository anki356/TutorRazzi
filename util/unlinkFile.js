import fs from 'fs'
import path from 'path'
const unlinkFile=async(fileName)=>{
    if(fs.existsSync(path.resolve()+"/uploads/"+""+fileName)){
    fs.unlinkSync(path.resolve()+"/uploads/"+""+fileName)
    }
}
export default unlinkFile