import mongoose, { Schema, model, Types } from "mongoose";



const GameSchema = new Schema({
    players: [
        {
            type: Types.ObjectId,
            ref: 'User',
            // validate: {
            //     validator: function (v) {
            //         return v.length === 2;
            //     },
            //     message: props => `Players array must have exactly 2 elements.`
            // }
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
            // validate: {
            //     validator: function (v) {
            //         return v.length === 2;
            //     },
            //     message: props => `Boards array must have exactly 2 elements.`
            // }
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
