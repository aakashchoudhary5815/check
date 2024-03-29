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

const corsOptions = {
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization'] 
};

app.use(cors(corsOptions));
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

(async () => {
  try {
    await connect(process.env.MONGO_URI, { bufferCommands: false });
    console.log("MongoDB connected successfully");
    
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
})();

