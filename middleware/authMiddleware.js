// const jwt = require("jsonwebtoken");
// const HttpError = require("../models/errorModel");

// const authMiddleware = (req, res, next) => {
//   const Authorization = req.headers.Authorization || req.headers.authorization;

//   if (!Authorization && !Authorization.startsWith("Bearer")) {
//     const token = Authorization.split(" ")[1];
//     jwt.verify(token, process.env.JWT_SECRET, (err, info) => {
//       if (err) {
//         return next(new HttpError("Unauthorized", 403));
//       }
//       req.user = info;
//       next();
//     });
//   } else {
//     return next(new HttpError("No token", 403));
//   }
// };

// module.exports = authMiddleware;

const jwt = require("jsonwebtoken");
const HttpError = require("../models/errorModel");

const authMiddleware = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer")) {
    return next(new HttpError("Unauthorized: No token provided", 403));
  }

  const token = authorizationHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, info) => {
    if (err) {
      return next(new HttpError("Unauthorized: Invalid token", 403));
    }
    req.user = info;
    next();
  });
};

module.exports = authMiddleware;
