import mongoose, { Schema, model, Types } from "mongoose";



const BoardSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: 'User'
    },
    board: {
        type: [[Number]],  // 5x5 array of numbers
        validate: {
            validator: (v) => v.length === 5 && v.every(row => row.length === 5),  // Ensures 5x5 structure
            message: 'Board must be a 5x5 grid.'
        },
        required: true
    },
},
    {
        timestamps: true,
    }
);

export const Board = mongoose.models.Board || model('Board', BoardSchema);
