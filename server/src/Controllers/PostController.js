import PostService from '../Services/PostService.js';
import Post from '../Models/Post.js';
import jwt from 'jsonwebtoken';

class PostController {
    async createPost(req, res) {
        try {
            const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET_KEY);    

            const post = await PostService.create({title: req.body.title, content: req.body.content, author: decoded._id});
            return res.json(post);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async getPosts(req, res) {
        try {
            const posts = await PostService.getAll();
            return res.json(posts);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async getPost(req, res) {
        try {
            const post = await PostService.getOne(req.params.id);
            return res.json(post);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async getPostsByAuthorID(req, res) {
        try {
            if(!req.params.userID){
                throw new Error('ID empty!')
            }
            const posts = await Post.find({author: req.params.userID})
            return res.json(posts);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async updatePost(req, res) {
        try {
            const post = await PostService.update(req.params.id, req.body);
            return res.json(post);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async deletePost(req, res) {
        try {
            const post = await PostService.delete(req.params.id);
            return res.json(post);
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }
}

export default new PostController();
