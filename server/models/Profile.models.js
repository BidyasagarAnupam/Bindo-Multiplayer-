import mongoose, { Schema, model, Types } from "mongoose";



const ProfileSchema = new Schema({
    displayName: {
        type: String,
        // required: true,
        unique: true,
    },
    friends: [{
        type: Types.ObjectId,
        ref: 'User'
    }],
    gender: {
        type: String,
        // required: true,
        enum: ["Male", "Female", "Other"],
    },
    dob: {
        type: Date,
        // required: true,
    },
    avatar: {
        type: String,
    },
    totalGamePlayed: {
        type: Number,
        default: 0,
    },
    totalGameWon: {
        type: Number,
        default: 0,
    },
    coins: {
        type: Number,
        default: 50,
    }
},
    {
        timestamps: true,
    }
);


export const Profile = mongoose.models.Profile || model('Profile', ProfileSchema);
