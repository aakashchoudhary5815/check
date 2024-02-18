const express = require("express");
const cors = require("cors");
const { connect } = require("mongoose");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const upload = require("express-fileupload");
const path = require("path");

const app = express();

// Example CORS setup in Express
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // Update with your React app's origin
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
// app.use(cors());
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use(upload());
// app.use("/uploads", express.static(__dirname + "uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Routes

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

//Error Middleware

app.use(notFound);
app.use(errorHandler);

connect(process.env.MONGO_URI)
  .then(
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    })
  )
  .catch((error) => console.log(error));
