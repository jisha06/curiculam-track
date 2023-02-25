const Express = require("express");
const Body_parser = require("body-parser");
const Mongoose = require("mongoose");
const Cors =  require("cors");
const path=require('path');
const PORT = 3005;
const Bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Multer = require('multer');
const UserModel = require("./models/Users");
const ReqModel = require('./models/requirement')
const CurModel = require("./models/curriculum");
const SaveModel = require("./models/savecurriculum")
const ErrorMessage = require("./config/errors");

const app =new Express();
app.use("/uploads",Express.static("./uploads"));

app.use(Express.static(path.join(__dirname+'/build')));
app.use(Body_parser.json());
app.use(Body_parser.urlencoded({extended:true}));
app.use(Cors());


Mongoose.connect("mongodb+srv://ictakcurriculum:anprs@ictak-curriculum-tracke.k6qgvbb.mongodb.net/UserDB?retryWrites=true&w=majority",{useNewUrlParser: true});


//signup 

app.post('/api/signup',async(req,res)=>{
    
    try {
        let data = {
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            username : req.body. username,
            password : Bcrypt.hashSync(req.body.password,10),
            confirmPassword  : Bcrypt.hashSync(req.body.confirmPassword,10)
          
            
        }
        // console.log(data);
        let User = await UserModel.findOne({email : req.body.email})
        if(!User){
            const newUser = new UserModel(data);
            await newUser.save( (error,data)=>{
                if (error) {
                    res.json({"status": "Failed", "Error": error});
                } else {
                    res.json({"status": "success", "Data": data});
                }
            });
            
            
        }
        else{ 
            res.json({message :"Email already registered"});
        }
    } catch (error) {
        console.log(error)
                 
    }
})
//lOGIN
app.post("/api/login",(req,res)=>{
    try{  
       var email =req.body.email;
       var password=req.body.password;
       var role=req.body.role;
       
     
        
    
            UserModel.find({ email : email },(err,data)=>{
            if(data.length>0){
               
               const PasswordValidator=Bcrypt.compareSync(password,data[0].password)
               if(PasswordValidator){
                    jwt.sign({email :email ,id:data[0]._id},"ictakproject",{expiresIn:"1d"},
                    (err,token)=>{
                       if (err) {
                           res.json({"status":"error","error":err}) 
                       } 
                       else {
                           res.json({"status":"success","data":data,"token":token})
                           
                       }
                    })
                   
               }
               else{
                   res.json({"Status":"Failed to Login","data":"Invalid Password"})
               }
           }
           else{
               res.json({"Status":"Failed to Login","data":"Invalid Email id"})
           }
       })
    
}catch(error){
       console.log(error)
   }
    
   })


//FILE UPLOAD
const fileStorageEngine = Multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, './uploads')	//foldername
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname + Date.now().toString()+'.pdf')
    }
})


//middleware
const upload = Multer({storage: fileStorageEngine});

app.post('/api/addrequirement',upload.single("photo"), async (req, res) => {

    try {
        let data1 = {
            reqname: req.body.reqname,
            area: req.body.area,
            institution: req.body.institution,
            catagory: req.body.catagory,
            hours: req.body.hours,
            imgpath:req.file.filename

        }
        
        const newReq = new ReqModel(data1);
        newReq.save((err,data)=>{
            if (err) {
                res.json({"error":err});
            } else {
                res.json({"status":"success","data":data})
            }
        });
            
            
       
    } catch (error) {
        console.log(error)

    }
})


// faculty listrequirement
app.get('/api/reqlist', async (req, res) => {
    try {
        let list = await ReqModel.find({ "status": "notrespond" })

        res.send(list)

    } catch (error) {
        console.log(error)
    }
})

// display past curriculum by admin
app.get('/api/pastlist',async (req, res) => {
    try {
        let curr = await CurModel.find ({ "status": "approved" })
        res.send(curr)

    } catch (error) {
        console.log(error)
    }
})




// display past curriculum by faculty
app.get('/api/pastlistbyfaculty',async (req, res) => {
    try {
        let curr = await CurModel.find ({"status":"approved"})
        res.send(curr)

    } catch (error) {
        console.log(error)
    }
})


// curriculum upload by faculty
const storage = Multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"./public/uploads")
    },
    filename:function(req,file,cb){
        cb(null,file.originalname + Date.now().toString()+'.pdf')
    }
 })

 const Mul = Multer({storage: storage});

// path
const pathh = path.resolve(__dirname,'public');
app.use(Express.static(pathh));
  
// new upload
    app.post('/api/curriculumupload',Mul.single('pdf'),(req,res)=>{
        let cur = 'uploads/' + req.file.originalname;
        let comments = req.body.comments;
        let title = req.body.title;
        let area = req.body.area; 
        let institution = req.body.institution;
        let category = req.body.category;
        let temp = new CurModel({
            pdfpath: cur,
            comments:comments,
            title:title,
            area:area,
            institution:institution,
            category:category
        })
        temp.save((err,data)=>{
            if (err) {
                console.log(err);
            } else {
                res.json({"status":"success", "data":data})
            }
        })
    })

// Download curriculum by admin
app.get('/api/download/:id',(req,res)=>{
    // var hex = /[0-9A-Fa-f]{6}/g;
    var id =req.params.id;
    // id = (hex.test(id))? ObjectId(_id) : id;

    CurModel.findById({_id:id},(err,data)=>{
         if(err){
             console.log(err)
         }
         else{
             let x = __dirname+'/public/'+data[0].pdfpath;
             res.download(x)
         }
    })
})


//download




//DISPLAY curriculum
app.post('/api/displaycurriculum',(req, res) => {   
    CurModel.find(
        (err,data)=>{
            
            if (err) {
                res.json({"status":"Error","Error":err})
            } else {
               res.json(data)  
            }
        }
    )

})

// ADMIN VIEW
// ADMIN UPDATE

app.put('/api/curriculum/:id/status',async (req,res)=>{
    try{
    let {status} = req.body
    let {id} = req.params
    if(!status){
        return res.status(400).json({
            success: false,
            error: ErrorMessage.errorlang.FIELD_MISSING.BODY + ' : Status'
        });
    }
    if(!id){
        return res.status(400).json({
            success: false,
            error: ErrorMessage.errorlang.FIELD_MISSING.PARAMS + ' : id'
        });
    }
     
    let data = await CurModel.findOneAndUpdate({_id:id}, {status}, {
        new: true
      });
     
      return res.status(200).json({
        success: true,
        data: data
    });
   } catch (error) {
    if(error.name === ErrorMessage.errorlang.CURRICULUM_ERRORMESSAGE){

        return res.status(400).json({
            success: false,
            error: ErrorMessage.errorlang.WRONG_CURRICULUM
        });
    }
    return res.status(400).json({
        success: false,
        error: error.message
    });
   }
})

// admin delete
app.delete('/api/curricul/delete/:id',(req,res)=>{
    let id = req.params.id;
    CurModel.deleteOne(
        ({_id:id},(err,data)=>{
            if (err) {
                res.json({"status":"error","error": err});
            } else {
                res.json({"status":"delete","data":data});
            }
        })
    )
})


// approve curriculum
app.post('/api/curupdate',(req,res)=>{
    let data =  req.body
    
    const currupdate = new SaveModel(data);
    currupdate.save(
    (err,data)=>{
        if (err) {
            res.json({"status":"error","error": err});
        } else {
            res.json({"status":"saved","data":data});
        }
    })
    } )

// approved list
app.get('/api/approvedlist',(req,res)=>{
    console.log("data")
})




// display curriculum by status
app.get("/api/curriculum", async (req, res) => {
    try {
      filter = {};
      if (req.query.status) {
        filter = { status: req.query.status };
      }
  
      let list = await CurModel.find( filter ).sort({ _id: -1 });
  
      res.send(list);
    } catch (error) {
      console.log(error);
    }
  });



app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});
// listen
app.listen(PORT,()=>{
    console.log(`Server started listening to port ${PORT}`);
})



