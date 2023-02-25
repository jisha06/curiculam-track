const Mongoose = require("mongoose"); 
const Schema = Mongoose.Schema

const CurSchema = new Schema({
    
    pdfpath: {
        type : String,
         
    },
    comments: {
        type: String,
        
     },
     title: {
        type : String ,
        
    },
    area: {
        type : String ,
        
    },
    institution: {
        type : String ,
        
    },
    category: {
        type : String ,
        
    },
    status: {
        type: String,
        default: "notapproved"  
     }           
});
let CurModel = Mongoose.model("curriculums",CurSchema);
module.exports = CurModel;