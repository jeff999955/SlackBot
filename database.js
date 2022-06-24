const Problem = require("./model/problem");
const mongoose = require("mongoose");
const WebSocket = require("ws");
var randomSample = require("@stdlib/random-sample");

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

    const getProblems = async (difficulty, numberProblems) => {
      const problems = await findProblem({
        "difficulty.level": difficulty,
        done: false,
      });
      const returnProblems = randomSample(problems, {
        size: numberProblems,
        replace: false,
      });
      return returnProblems;
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
        case "generate": {
          // payload: { difficulty: int, numProblems: int }
          try {
            const { difficulty, numProblems } = payload;
            sendData(["success", await getProblems(difficulty, numProblems)]); 
          } catch (err) {
            sendStatus("fail");
            console.error("fail");
            console.error(err);
          }
        }
        default:
          console.log(task);
          console.log(payload);
          break;
      }
    };
  });
});
