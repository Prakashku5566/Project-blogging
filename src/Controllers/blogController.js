const blogModel = require("../Model/blogModel")
const authorModel = require("../Model/authorModel");
//const mongoose = require('mongoose')
const {stringvalid,isValidObjectId,isvalidBody,validbookTittle} = require("../validator/validator")

//-------------------------------------create blog------------------------------------------------//
const createBlog = async (req, res) => {
    try {
        let data = req.body;
        if (!isvalidBody(data)) { return res.status(400).send({ status: false, msg: "incomplete request data/please provide more data" }) }

        let { title, authorId, category, body, isPublished, tags, subcategory } = data
        // ==Mandatory_fields== \\

        if (!title||(!validbookTittle(title))) return res.status(400).send({ status: false, msg: "Title is required it should be valid" })
        if (!body||(!validbookTittle(body))) return res.status(400).send({ status: false, msg: "body is required it should be valid" })
        if (!category||(!validbookTittle(category))) return res.status(400).send({ status: false, msg: "category is required it should be valid" })
        if (!authorId||(!isValidObjectId(authorId))) return res.status(400).send({ status: false, msg: "author id required it should be valid" })
        //==format==\\
        if(tags){
            if(!stringvalid(tags)){return res.status(400).send({status:false,message:"please provide valid tags"})}
        }

        // ==Duplication== \\
        let authId = await authorModel.findById(authorId) 
        if (!authId) { return res.status(404).send({ status: false, msg: "!!Oops author id doesn't exist" }) }
        let tokenUser = req.token.authorId
        if (req.body.authorId !== tokenUser) {
            return res.status(400).send({ status: false, msg: "you are not authorized" });
        }
        let blogcheck = await blogModel.findOne({ title:title, isDeleted: false })
        if (blogcheck) return res.status(400).send({ status: false, msg: "this blog is already present" })

        if (isPublished === true) { data.publishedAt = Date.now() }

        let savedData = await blogModel.create(data)
        //immutable object 
        return res.status(201).send({ data: savedData })
    } catch (err) {
       return res.status(500).send({ status: false, status: false, msg: err.message })
    }
}

//------------------------------------------fetching blogs-----------------------------------------//
const getBlogs = async (req, res) => {
    try {
        let combination = req.query
        let {authorId,category,tags,subcategory}=combination
        if(authorId){
            if(!isValidObjectId(authorId))return res.status(400).send({status:false,message:"please enter valid authorid"})
        }
        let dataBlog = await blogModel.find({ $and: [{ isDeleted: false, isPublished: true }, combination] })
        if (dataBlog == 0) {
            return res.status(404).send({ status: false, msg: " No Such Blog found " })
        } else
            return res.status(200).send({ data: dataBlog })
    } catch (err) {
        res.status(500).send({ status: false, status: false, msg: err.message })
    }
}


//------------------------------------upadation---------------------------------------//
const updateBlog = async function (req, res) {
    try {
        let data = req.params.blogId
        let update = req.body
        //===input===\\
        if (Object.keys(update).length == 0) { return res.status(400).send({ status: false, msg: "incomplete request data/please provide more data" }) }
       //===format===\\
        if (update.title || update.body ) {
            if (typeof (update.title || update.body) !== "string") {
                return res.status(400).send({ status: false, msg: "title/body should be in string only" })
            }
        }
        if (update.tags || update.subcategory) {
            if (typeof (update.tags || update.subcategory) !== "object") {
                return res.status(400).send({ status: false, msg: "tags/subcategory should be in array of string only" })
            }
        }
        if (update.isPublished) {
            if (typeof update.isPublished !== "boolean") {
                return res.status(400).send({ status: false, msg: "is Published input is needed" })
            }
        }

        let alert = await blogModel.findOne({ _id: data, isDeleted: true })
        if (alert) return res.status(404).send({ status: false, msg: "no blog found" })

        //====upadation====\\
        let blogs = await blogModel.findOneAndUpdate({ _id: data },
            {
                title: update.title, body: update.body, isPublished: update.isPublished, publishedAt: Date.now()
                , $push: { tags: update.tags, subcategory: update.subcategory }
            }, { new: true }) // , upsert: true 
        return res.status(200).send({ status: true, msg: blogs })
    } catch (err) {return res.status(500).send({ status: false, msg: err.message }) }
}

//....................deletion1..............................................................

const deleteBlogs = async (req, res) => {
    try {
        let BlogId = req.params.blogId
        let findData = await blogModel.findOne({ _id: BlogId, isDeleted: false })
        if (!findData) {
            return res.status(404).send({ status: false, msg: "no blog found" })
        } else {
            await blogModel.findOneAndUpdate({ _id: BlogId },
                { $set: { isDeleted: true, deletedAt: Date.now() } })
            return res.status(200).send({ status: true, msg: "data deleted successfully" })
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }

}

//..............................deletion2...............................

const deleteBlogs2 = async (req, res) => {
    try {
        let data = req.query;
        if (Object.keys(data).length == 0) { return res.status(400).send({ status: false, msg: "No parameters passed!!Blog Unmodified" }) }
        let blog = await blogModel.findOne({ $and: [{ isDeleted: false, isPublished: false }, data] })
        if (!blog) { return res.status(404).send({ status: false, msg: "no such blog present ok" }) }
        let authid = blog.authorId.toString()
        let tokenUser = req.token.authorId;
        if (authid !== tokenUser) { return res.status(403).send({ status: false, msg: "unauthorized!!user info doesn't match" }) }
        await blogModel.updateMany(data, { isDeleted: true, deletedAt: Date.now() })
        return res.status(200).send({ status: true, Deleted: "deletion of blog is completed" })
    }

    catch (err) { return res.status(500).send({ status: false, error: err.message }) };

}


module.exports = { createBlog, getBlogs, updateBlog, deleteBlogs, deleteBlogs2 }