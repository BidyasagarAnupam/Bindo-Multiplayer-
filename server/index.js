import express from "express";
import 'dotenv/config'
import { connect } from "./config/database.js";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";


import userRoute from './routes/User.routes.js'
import profileRoute from "./routes/Profile.routes.js";
import boardRoute from "./routes/Board.routes.js";
import { errorMiddleware } from "./middlewares/tryCatch.js";

// Constants from .env
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;

// Connect to database
connect()

const corsOptions = {
    origin: [
        "http://localhost:5173",
        "http://localhost:4173",
        "192.168.143.171:5173",
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

io.on("connection", (socket) => {
    console.log("a user connected", socket.id);


    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

// Apply middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

// mounting routes
app.use("/api/v1/user", userRoute)
app.use("/api/v1/profile", profileRoute)
app.use("/api/v1/board", boardRoute)


app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use(errorMiddleware)

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
