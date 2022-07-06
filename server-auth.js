require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
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
  const pwMatch = bcrypt.compareSync(password, process.env.USER_PASSWORD);
  if (pwMatch) {
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
