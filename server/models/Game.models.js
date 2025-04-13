import mongoose, { Schema, model, Types } from "mongoose";



const GameSchema = new Schema({
    players: [
        {
            type: Types.ObjectId,
            ref: 'User',
        }
    ],
    status: {
        type: String,
        default: "inProgress",
        enum: ["inProgress", "completed"],
    },
    boards: [
        {
            type: Types.ObjectId,
            ref: 'Board',
        }
    ],
    winner: {
        type: Types.ObjectId,
        ref: 'User',
        default: null,
    },

},
    {
        timestamps: true,
    }
);


export const Game = mongoose.models.Game || model('Game', GameSchema);
