const { isValidObjectId } = require("mongoose");
const Blog = require("../models/Blog");
const { default: slugify } = require("slugify");

class BlogController {
  async addBlog(req, res) {
    try {
      const { nameAuthor, avatar, name, title } = req.body;
      const newBlogData = {
        ...req.body,
        name: name,
        slug: slugify(name),
        author: {
          nameAuthor: nameAuthor,
          avatar: avatar,
        },
        field: {
          title,
          slugField: slugify(title),
        },
      };
      const newBlog = new Blog(newBlogData);

      const saveBlog = await newBlog.save();

      res.status(200).json({
        data: saveBlog,
        error: null,
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async getAllBlog(req, res) {
    const totalBlog = await Blog.countDocuments();

    const items = await Blog.find({});
    res.status(200).json({
      success: true,
      error: null,
      statusCode: 200,
      data: {
        total: totalBlog,
        items,
      },
    });
  }

  async getByIdBlog(req, res) {
    try {
      const id = req.params.id;

      if (isValidObjectId(id)) {
        const blog = await Blog.findById({ _id: id });
        res.status(200).json({
          success: true,
          error: null,
          statusCode: 200,
          data: blog,
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  }

  async getBySlug(req, res) {
    try {
      const slug = req.params.slug;
      const blog = await Blog.findOne({ slug: slug });
      res.status(200).json({
        success: true,
        error: null,
        statusCode: 200,
        data: blog,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async updateBlog(req, res) {
    try {
      const updateBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updateBlog) {
        return res.status(404).json({
          message: "Không tìm thấy bản ghi",
          statusCode: 404,
          success: false,
        });
      }
      res.status(200).json({
        data: updateBlog,
        error: null,
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async delBlog(req, res) {
    try {
      await Blog.deleteOne({ _id: req.params.id });
      res.status(200).json({
        message: "Xóa Blog thành công",
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async filterBlog(req, res) {
    try {
      const { name, title, slugField, nameAuthor } = req.body;
      let filter = {};

      if (name) filter.name = { $regex: new RegExp(name, "i") };
      if (title) filter["field.title"] = { $regex: new RegExp(title, "i") };
      if (slugField)
        filter["field.slugField"] = { $regex: new RegExp(slugField, "i") };
      if (nameAuthor)
        filter["author.nameAuthor"] = { $regex: new RegExp(nameAuthor, "i") };

      const result = await Blog.find(filter);
      const totalBlog = await Blog.countDocuments(filter);

      res.json({
        success: true,
        error: null,
        statusCode: 200,
        data: {
          total: totalBlog,
          items: result,
        },
      });
    } catch (error) {
      // res.status(500).json({
      //     error: 'Có lỗi trong quá trình xử lý yêu cầu'
      // })
      console.log("error", error);
    }
  }
}

module.exports = new BlogController();
