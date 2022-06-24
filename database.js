const Problem = require("./model/problem");
const mongoose = require("mongoose");
const WebSocket = require("ws");

require("dotenv").config();
const wss = new WebSocket.Server({ port: process.env.PORT });

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", (e) => {
  console.error(e);
});
db.once("open", () => {
  console.log("MongoDB connected!");

  wss.on("connection", (ws) => {
    console.log("Currently working");
    const sendData = (data) => {
      ws.send(JSON.stringify(data));
    };

    const sendStatus = (s) => {
      sendData(["status", s]);
    };

    const findProblem = async (condition) => {
      return await Problem.find(condition);
    };

    ws.onmessage = async ({ data }) => {
      // console.log(data);
      const [task, payload] = JSON.parse(data);

      switch (task) {
        case "insert": {
          // payload: List of problems
          try {
            await Problem.insertMany(payload);
            sendStatus("success");
          } catch (err) {
            sendStatus("fail");
            console.error(err);
          }
          break;
        }
        case "find": {
          // payload: Problem
          try {
            sendData(["success", await findProblem(payload)]);
          } catch (err) {
            sendStatus("fail");
            console.error(err);
          }
          break;
        }
        default:
          break;
      }
    };
  });
});
