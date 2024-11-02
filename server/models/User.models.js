import mongoose, { Schema, model, Types } from "mongoose";
import { hash } from "bcrypt";

const UserSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    profileDetails: {
        type: Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    allBoards: [
        {
            type: Types.ObjectId,
            ref: 'Board'
        }
    ],
    allGames: [
        {
            type: Types.ObjectId,
            ref: 'Game'
        }
    ],
},
    {
        timestamps: true,
    }
);

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await hash(this.password, 10);
})

export const User = mongoose.models.User || model('User', UserSchema);
