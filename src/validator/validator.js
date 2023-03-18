const mongoose = require("mongoose")
const stringvalid = function (value){
    value = value.trim()
    return /[^(A-Z)]+[a-z]+(?:(?:|['_\. ])([a-z]*(\.\D)?[a-z])+)*$/.test(value)
}

const validEmail = (value)=>{
    return /[a-zA-Z0-9_\-\.]+[@][a-z]+[\.][a-z]{2,3}/.test(value)
}

const passValid = (value)=>{
    return /^[a-zA-Z0-9@]{6,10}$/.test(value)
}

const isvalidBody = (value) => {
    return Object.keys(value).length > 0;
}

const validTittle = (value)=>{
    let title =["Mr", "Mrs", "Miss"]
    return title.includes(value)
}

const validbookTittle = (value)=>{
    value = value.trim()
    return /^[a-zA-Z0-9.'\-_\s]*$/.test()
}

const isValidObjectId = (value) => {
    return mongoose.Types.ObjectId.isValid(value)
}
module.exports = {stringvalid,validEmail,passValid,isvalidBody,validTittle,validbookTittle,isValidObjectId}