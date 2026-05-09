import mongoose from "mongoose";
import { uuid } from "uuidv4"; 
const {Schema} = mongoose;
import Comment from './Review.js';

const PostSchema = new mongoose.Schema(
    {
        _id:{
            type: String,
            default: uuid,
        },

        title:{
            type: String,
            required: true,
        },

        content:{
            type: String,
            required: true,
        },

        author: {
            type: String,
            default: "1234",
            //required: true,
            ref: 'User',
        },

        comments: [{
            type: String,
            ref: 'Comment',
        }]

    },{timestamps: true}
);

export default mongoose.model('Post', PostSchema);