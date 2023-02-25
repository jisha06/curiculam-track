const Mongoose = require("mongoose"); 
const Schema = Mongoose.Schema

const SavCurSchema = new Schema({
    
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
        default: "approved"  
     }           
});
let SaveModel = Mongoose.model("curriculs",SavCurSchema);
module.exports = SaveModel;