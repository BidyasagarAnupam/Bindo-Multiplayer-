import express from "express";
import 'dotenv/config'
import {connect} from "./config/database.js";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";


// Constants from .env
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;

// Connect to database
connect()

const corsOptions = {
    origin: [
        "http://localhost:5173",
        "http://localhost:4173",
        CLIENT_URL,
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};


const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: corsOptions,
});

app.set("io", io);

// Apply middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));



app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
