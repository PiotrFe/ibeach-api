require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const port = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(bodyParser.text());
app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.post("/auth", async (req, res) => {
  const { name, password } = req.body;
  if (password === process.env.USER_PASSWORD) {
    return res.status(200).json({
      name,
      authorized: true,
    });
  }

  return res.status(401).json({
    name,
    authorized: false,
  });
});
