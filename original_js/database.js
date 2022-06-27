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

    const findLeetcodeProblems = async (condition) => {
      return await Problem.find(condition);
    };

    const getLeetcodeProblems = async (difficulty, numProblems) => {
      const problems = await findLeetcodeProblems({
        "difficulty.level": difficulty,
        done: false,
      });
      const returnProblems = randomSample(problems, {
        size: numProblems,
        replace: false,
      });
      returnProblems.forEach((problem) =>
        Problem.findByIdAndUpdate(problem._id.toString(), { done: true }).exec()
      );
      return {
        difficulty: difficulty,
        numProblems: numProblems,
        problems: returnProblems,
      };
    };

    ws.onmessage = async ({ data }) => {
      const [task, payload] = JSON.parse(data);
      switch (task) {
        case "insert": {
          // payload: List of problems
          try {
            await Problem.insertMany(payload);
            sendStatus("insert_success");
          } catch (err) {
            sendStatus("insert_fail");
            console.error(err);
          }
          break;
        }
        case "find": {
          // payload: Problem
          try {
            sendData(["find_success", await findLeetcodeProblems(payload)]);
          } catch (err) {
            sendStatus("find_fail");
            console.error(err);
          }
          break;
        }
        case "generate": {
          // payload: { difficulty: int, numProblems: int }
          try {
            const { difficulty, numProblems } = payload;
            sendData([
              "generate_success",
              await getLeetcodeProblems(difficulty, numProblems),
            ]);
          } catch (err) {
            sendStatus("generate_fail");
            console.error(err);
          }
          break;
        }
        default:
          console.log(task);
          console.log(payload);
          break;
      }
    };
  });
});
