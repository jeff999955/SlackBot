const Problem = require("./model/problem");
const mongoose = require("mongoose");
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 4000 });

MONGO_URL =
  "mongodb+srv://nl:nlnl8787@cluster0.hnxxxp6.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(MONGO_URL, {
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

    const findProblem = (callback) => {
      Problem.find()
        .sort({ "difficulty.level": -1 })
        .limit(10)
        .exec((err, res) => {
          if (err) throw err;
          callback();
        });
    };

    ws.onmessage = ({ data }) => {
      // console.log(data);
      const [task, payload] = JSON.parse(data);

      console.log(payload[0]);
      switch (task) {
        case "insert": {
          // payload: List of problems
          Problem.insertMany(payload)
            .then(sendData(["success", "success"]))
            .catch((e) => {
              sendData(["error", e]);
              console.log(e);
            });
          break;
        }
        default:
          break;
      }
    };
  });
});
