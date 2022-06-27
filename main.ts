import mongoose from "mongoose";

require("dotenv").config();

mongoose.connect(process.env.MONGO_URL as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} as mongoose.ConnectOptions);

const db: mongoose.Connection = mongoose.connection;

db.on("error", (e) => console.error(e));

db.once("open", () => {
    console.log("connected to mongoDB");
});
