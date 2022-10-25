const authorModel = require("../Model/authorModel")
const jwt = require("jsonwebtoken");

const {stringvalid,validEmail,passValid,isvalidBody,validTittle} = require("../validator/validator")

const createAuthor = async (req, res) => {
    try {
        if (!isvalidBody(req.body)) { return res.status(400).send({ status: false, message: "incomplete request please provide  data for creation" }) }
        let { fname, lname, title, email,password } = req.body//data
       
        if (!fname ||(!stringvalid(fname))) { return res.status(400).send({ status:false,message: "please enter fname and it should be valid" }) }
        
        if (!lname ||(!stringvalid(lname))) { return res.status(400).send({ status:false,message: "please enter lname and it should be valid" }) }
        
        if (!title||(!validTittle(title))){return res.status(400).send({status : false,message: "please provide tittle it should be  Mr or Mrs or Miss only" })}
       
        if (!email ||(!validEmail(email))) { return res.status(400).send({ status:false,message: "please provide email it should be valid format =>(examplexx@xyz.xyz)" }) }
        
        if (!password ||(!passValid(password))) { return res.status(400).send({ status:false,message: "please provide password it must contain at least one alphabet one number and one special character minimum 6 character" }) }
        //----dublicate key---//

        let inUse= await authorModel.findOne({email:email})
        if(inUse)return res.status(400).send({status:false,message:"email already in use"})
        //----creating authors-----------------------------//
        let data ={fname,lname,title,email,password}
        let savedData = await authorModel.create(data)
        return res.status(201).send({status:true,message:"success", data: savedData })

    } catch (err) {
      return  res.status(500).send({ err: err.message, status: false })
    }
}

const login = async (req, res) => {
    try {
        let data = req.body
        if (!isvalidBody(data)) { return res.status(400).send({ status: false, message: "incomplete request data/please provide more data" }) }

     let {email,password}=data
        if (!email) {return res.status(400).send({ status: false, message: "please enter  your email" })} 
         if (!password) {return res.status(400).send({ status: false, message: "please enter your password" })}
         
            let user = await authorModel.findOne({ email: email, password: password });
            if (!user) {
                return res.status(401).send({ status: false, message: "your email or password is incorrect" })
            } 

                let token = jwt.sign(
                    {
                        authorId: user._id.toString(), 
                        team: "Group-09"
                    }, "group-09-secretkey");
                 res.setHeader("x-api-key", token);
             return res.status(200).send({ status: true, message: "login successful ",token });
            
    } catch (err) {
     return res.status(500).send({ status: false, message: err.message })

    }
}

module.exports = { createAuthor, login }
