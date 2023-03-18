const express = require("express");
const router =express.Router();
const AuthorController = require("../Controllers/authorController")
const BlogController = require("../Controllers/blogController")
const mw=require("../middleWare/auth")

router.post("/authors", AuthorController.createAuthor)
router.post("/login", AuthorController.login)

router.post("/blogs",mw.authenticate, BlogController.createBlog)
router.get("/blogs",mw.authenticate,mw.authIdValid, BlogController.getBlogs)

router.put("/blogs/:blogId",mw.blogIdValid,mw.authenticate,mw.authorize, BlogController.updateBlog)
router.delete("/blogs/:blogId",mw.blogIdValid,mw.authenticate,mw.authorize, BlogController.deleteBlogs)
router.delete("/blogs",mw.authenticate, BlogController.deleteBlogs2)


router.all("/**", function (req, res) {
    try{
    res.status(404).send({
        status: false,
        msg: "The api you request is not available"
    })
}catch(err){res.send(err.message)}
})





module.exports=router;
