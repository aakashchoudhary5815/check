const HttpError = require("../models/errorModel");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

//Register New User

//POST: api/users/register
// Unprotected
const registerUser = async (req, res, next) => {
  // Function to handle user registration
  try {
    // Destructure user data from request body
    const { name, email, password, password2 } = req.body;

    // Validate required fields
    if (!name || !email || !password || !password2) {
      return next(new HttpError("All fields are required", 422)); // Send 422 error for missing fields
    }

    // Normalize email to lowercase for consistency
    const newEmail = email.toLowerCase();

    // Check for existing user with the same email
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return next(new HttpError("Email already exists", 422));
    }

    // Validate password strength
    if (password.trim().length < 6) {
      return next(new HttpError("Password must be at least 6 characters", 422));
    }

    // Ensure password confirmation matches
    if (password !== password2) {
      return next(new HttpError("Passwords do not match", 422));
    }

    // Hash the password securely using bcrypt
    const salt = await bcrypt.genSalt(10); // Generate a salt for password hashing
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt

    // Create a new user in the database
    const newUser = await User.create({
      name,
      email: newEmail, // Use normalized email
      password: hashedPassword, // Store hashed password
    });

    // Send a success response with a confirmation message
    res.status(201).json(`New User ${newUser.email} has been registered`);
  } catch (error) {
    return next(
      new HttpError("User registration failed, please try again", 422)
    );
  }
};

//Login a registered user

//POST: api/users/login
// Unprotected
const loginUser = async (req, res, next) => {
  // Function to handle user login
  try {
    // Destructure email and password from request body
    const { email, password } = req.body;
    // Validate required fields
    if (!email || !password) {
      return next(new HttpError("All fields are required", 422));
    }

    // Normalize email to lowercase for consistency
    const newEmail = email.toLowerCase();

    // Find the user by email from the database
    const user = await User.findOne({ email: newEmail });
    // Check if user exists with the provided email
    if (!user) {
      return next(new HttpError("Invalid credentials", 422));
    }

    // Compare hashed password with the provided password
    const comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass) {
      return next(new HttpError("Invalid credentials", 422));
    }

    // Extract user ID and name for token creation
    const { _id: id, name } = user;

    // Sign a JWT token using user ID, name, and secret key
    const token = jwt.sign({ id, name }, process.env.JWT_SECRET, {
      expiresIn: "1d", // Set token expiry to 1 day
    });

    // Send a success response with the generated token, user ID, and name
    res.status(200).json({ token, id, name });
  } catch (error) {
    return next(
      new HttpError("Login failed, please check your credentials", 422)
    );
  }
};

//User Profile

//POST: api/users/:id
// protected
const getUser = async (req, res, next) => {
  // Function to handle fetching a user profile
  try {
    // Extract user ID from request parameters
    const { id } = req.params;
    // Find the user by ID from the database, excluding the password field
    const user = await User.findById(id).select("-password");
    // Handle the case where the user is not found
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    // Send a success response with the user data (without password)
    res.status(200).json(user);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//Change user avatar (profile picture)

//POST: api/users/change-avatar
// protected
const changeAvatar = async (req, res, next) => {
  // Function to handle user avatar update
  try {
    // Check if an avatar image is uploaded
    if (!req.files.avatar) {
      return next(new HttpError("Please choose an image", 422));
    }

    // Find the user from the database by their ID (extracted from auth middleware)
    const user = await User.findById(req.user.id);

    // Delete the old avatar file if it exists

    if (user.avatar) {
      fs.unlink(path.join(__dirname, "..", "uploads", user.avatar), (err) => {
        if (err) {
          return next(new HttpError(err));
        }
      });
    }

    // Access the uploaded avatar image
    const { avatar } = req.files;

    // Validate image size (less than 5MB)
    if (avatar.size > 5000000) {
      return next(
        new HttpError("Image size is too large, should be less than 5mb", 422)
      );
    }

    // Generate a unique filename for the uploaded avatar
    let fileName;
    fileName = avatar.name;
    let splittedFileName = fileName.split(".");
    let newFileName =
      splittedFileName[0] +
      uuid() +
      "." +
      splittedFileName[splittedFileName.length - 1];

    // Move the uploaded avatar to the uploads directory
    avatar.mv(
      path.join(__dirname, "..", "uploads", newFileName),
      async (err) => {
        if (err) {
          return next(new HttpError(err));
        }

        // Update the user document with the new avatar filename
        const updatedAvatar = await User.findByIdAndUpdate(
          req.user.id,
          { avatar: newFileName },
          { new: true }
        );

        // Handle the case where avatar update fails
        if (!updatedAvatar) {
          return next(new HttpError("Avatar update failed", 422));
        }
        // Send a success response with the updated user data (including new avatar)
        res.status(200).json(updatedAvatar);
      }
    );
  } catch (error) {
    return next(new HttpError(error));
  }
};

//Edit user details

//POST: api/users/edit-user
// protected
const editUser = async (req, res, next) => {
  // Function to handle editing user profile
  try {
    // Destructure user data from request body
    const { name, email, currentPassword, newPassword, confirmNewPassword } =
      req.body;
    // Validate required fields
    if (!name || !email || !currentPassword || !newPassword) {
      return next(new HttpError("All fields are required", 422));
    }

    // Find the user from the database by their ID (extracted from auth middleware)

    const user = await User.findById(req.user.id);
    // Handle the case where the user is not found
    if (!user) {
      return next(new HttpError("User not found", 404));
    }

    // Check for existing email address (excluding the user's own email)

    const emailExist = await User.findOne({ email });
    if (emailExist && emailExist._id != req.user.id) {
      return next(new HttpError("Email already exists", 422));
    }

    // Validate current password before allowing updates

    const validateUserPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!validateUserPassword) {
      return next(new HttpError("Invalid credentials", 422));
    }

    // Ensure new password confirmation matches

    if (newPassword !== confirmNewPassword) {
      return next(new HttpError("Passwords do not match", 422));
    }

    // Hash the new password securely using bcrypt

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // Update the user document with the new information

    const newInfo = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, password: hash }, // Update name, email, and hashed password
      { new: true } // Return the updated document
    );

    // Send a success response with the updated user data (without password)
    res.status(200).json(newInfo);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//Get all users

//POST: api/users/author
// Unprotected
const getAuthors = async (req, res, next) => {
  // Find all users from the database
  try {
    const authors = await User.find().select("-password"); // Exclude password field

    // Send a success response with an array of author data (without passwords)
    res.json(authors);
  } catch (error) {
    return next(new HttpError(error));
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  changeAvatar,
  editUser,
  getAuthors,
};
