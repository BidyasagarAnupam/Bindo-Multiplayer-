const CLIENT_URL = process.env.CLIENT_URL;

const BINGO_TOKEN = "bingo-auth-token";

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

export { BINGO_TOKEN, corsOptions }