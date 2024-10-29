import mongoose from "mongoose";
import 'dotenv/config'

export const connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => console.log("DB connected successfull"))
        .catch((error) => {
            console.log("DB connection Failed");
            console.error(error);
            process.exit(1);
        });
}