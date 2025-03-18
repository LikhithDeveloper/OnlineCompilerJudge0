// libraries imports
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { contentType } = require("express/lib/response");
//.env configuration(access the variables in .env with process.env.VARIABLE)
require("dotenv").config();

// app setup
const app = express();
app.use(express.json());
// cors cofiguration
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    // allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Databse interaction
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

// endpoints makeing
app.get("/", (req, res) => {
  res.send("Hello World!");
});

const headers = {
  "x-rapidapi-key": process.env.API_KEY,
  "x-rapidapi-host": "judge0-extra-ce.p.rapidapi.com",
  "Content-Type": "application/json",
};

app.get("/about", async (req, res) => {
  try {
    console.log("Hi");
    const response = await fetch(`${process.env.JUDGE0_URL}/about`, {
      headers,
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/languages", async (req, res) => {
  try {
    const response = await fetch(`${process.env.JUDGE0_URL}/languages`, {
      headers,
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// running code
app.post("/execute", async (req, res) => {
  const { source_code, language_id, stdin } = req.body;
  if (!source_code || !language_id || !stdin) {
    return res.status(400).json({ error: error.message });
  }
  try {
    const submissionRes = await fetch(`${process.env.JUDGE0_URL}/submissions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ source_code, language_id, stdin }),
    });
    const { token } = await submissionRes.json();
    setTimeout(async () => {
      try {
        const response = await fetch(
          `${process.env.JUDGE0_URL}/submissions/${token}`,
          {
            headers,
          }
        );
        const data = await response.json();
        console.log(data);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }, 1000);
    // res.json({ token: token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// used to listen the server
app.listen(process.env.PORT, () => {
  console.log(`Server started on the port: ${process.env.PORT}`);
});
