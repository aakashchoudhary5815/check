// const Post = require("../models/postModel");
// const User = require("../models/userModel");
// const path = require("path");
// const fs = require("fs");
// const { v4: uuid } = require("uuid");
// const HttpError = require("../models/errorModel");

// // Create a post
// // POST: api/posts
// // Protected

// const createPost = async (req, res, next) => {
//   // Function to handle creating a new blog post
//   try {
//     // Destructure title, category, and description from request body
//     let { title, category, description } = req.body;

//     // Input validation: check if all required fields are present and there's an uploaded file
//     if (!title || !category || !description || !req.files) {
//       return next(
//         new HttpError("Fill in all fields and choose thumbnail", 400)
//       );
//     }

//     // Access the uploaded thumbnail image
//     const { thumbnail } = req.files;

//     // Validate image size: ensure it's less than 2MB
//     if (thumbnail.size > 2000000) {
//       return next(new HttpError("Image size should not exceed 2mb", 400));
//     }

//     // Generate a unique filename for the uploaded image
//     let fileName = thumbnail.name;
//     let splittedFileName = fileName.split(".");
//     let newFileName =
//       splittedFileName[0] +
//       uuid() +
//       "." +
//       splittedFileName[splittedFileName.length - 1];

//     // Move the uploaded image to the uploads directory
//     thumbnail.mv(
//       path.join(__dirname, "..", "uploads", newFileName),
//       async (err) => {
//         if (err) {
//           // Handle errors during file upload
//           return next(new HttpError(err));
//         } else {
//           // Create a new Post instance with validated and sanitized data
//           const newPost = await Post.create({
//             title,
//             category,
//             description,
//             thumbnail: newFileName,
//             creator: req.user.id, // Access creator ID from authenticated user
//           });
//           if (!newPost) {
//             // Handle errors during post creation
//             return next(new HttpError("Post creation failed", 422));
//           }
//           // Update user's post count after successful post creation
//           const currentUser = await User.findById(req.user.id);
//           const userPostCount = currentUser.posts + 1;
//           await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

//           // Send a success response with the newly created post data
//           res.status(201).json(newPost);
//         }
//       }
//     );
//   } catch (error) {
//     // Handle any other errors during the process
//     return next(new HttpError(error));
//   }
// };

// // gET ALL posts
// // GET: api/posts
// // Protected

// const getPosts = async (req, res, next) => {
//   // Function to handle fetching all blog posts
//   try {
//     // Fetch all posts from the database, sorted by creation date (descending)
//     const posts = await Post.find().sort({ createdAt: -1 });
//     // Send a success response with the list of posts
//     res.status(200).json(posts);
//   } catch (error) {
//     // Handle any errors during the process
//     return next(new HttpError(error));
//   }
// };

// // Get a single post
// // GET: api/posts/:id
// // unProtected

// const getPost = async (req, res, next) => {
//   // Function to handle fetching a single blog post

//   try {
//     // Extract the post ID from the request parameters
//     const postId = req.params.id;
//     // Find the post by its ID in the database
//     const post = await Post.findById(postId);
//     if (!post) {
//       // Handle the case where the post is not found
//       return next(new HttpError("Post not found", 404));
//     }

//     // Send a success response with the fetched post data
//     res.status(200).json(post);
//   } catch (error) {
//     // Handle any errors during the process
//     return next(new HttpError(error));
//   }
// };

// // Get post by category
// // GET: api/posts/categories/:category
// // Protected

// const getCatPosts = async (req, res, next) => {
//   // Function to handle fetching posts by category
//   try {
//     // Extract the category name from the request parameters
//     const { category } = req.params;
//     // Find all posts matching the provided category, sorted by creation date (descending)
//     const catPosts = await Post.find({ category }).sort({ createdAt: -1 });
//     // Send a success response with the list of posts for the specified category
//     res.status(200).json(catPosts);
//   } catch (error) {
//     // Handle any errors during the process
//     return next(new HttpError(error));
//   }
// };

// // Get posts by author
// // GET: api/posts/users/:id
// // unProtected

// const getUserPosts = async (req, res, next) => {
//   // Function to handle fetching posts by author
//   try {
//     // Extract the user ID from the request parameters
//     const { id } = req.params;
//     // Find all posts where the creator ID matches the provided user ID, sorted by creation date (descending)
//     const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
//     res.status(200).json(posts);

//     // Send a success response with the list of posts created by the specified user
//   } catch (error) {
//     // Handle any errors during the process
//     return next(new HttpError(error));
//   }
// };

// // Edit post
// // PATCH: api/posts/:id
// // Protected

// const editPost = async (req, res, next) => {
//   // Function to handle editing an existing blog post
//   try {
//     // Declare variables to hold filenames and the updated post object
//     let fileName;
//     let newFileName;
//     let updatedPost;

//     // Extract the post ID from the request parameters
//     const postId = req.params.id;

//     // Destructure title, category, and description from the request body
//     let { title, category, description } = req.body;

//     // Validate required fields: title, category, and minimum description length
//     if (!title || !category || description.length < 12) {
//       return next(new HttpError("Fill in all fields", 422));
//     }
//     // Check if there's an uploaded file
//     if (!req.files) {
//       // If no file uploaded, update post data without thumbnail change
//       updatedPost = await Post.findByIdAndUpdate(
//         postId,
//         { title, category, description },
//         { new: true }
//       );
//     } else {
//       // If file uploaded, perform additional checks and updates

//       // Fetch the existing post data by ID from the database
//       const oldPost = await Post.findById(postId);
//       // Check if the current user is the creator of the post before allowing edits
//       if (req.user.id == oldPost.creator) {
//         // Delete the old thumbnail file from the uploads folder
//         fs.unlink(
//           path.join(__dirname, "..", "uploads", oldPost.thumbnail),
//           async (err) => {
//             if (err) {
//               return next(new HttpError(err));
//             }
//           }
//         );
//         // Handle the uploaded thumbnail
//         const { thumbnail } = req.files;

//         // Validate the uploaded image size (less than 2MB)
//         if (thumbnail.size > 2000000) {
//           return next(new HttpError("Image size should not exceed 2mb"));
//         }

//         // Generate a unique filename for the new uploaded image
//         fileName = thumbnail.name;
//         let splittedFileName = fileName.split(".");
//         newFileName =
//           splittedFileName[0] +
//           uuid() +
//           "." +
//           splittedFileName[splittedFileName.length - 1];

//         // Move the uploaded image to the uploads directory
//         thumbnail.mv(
//           path.join(__dirname, "..", "uploads", newFileName),
//           async (err) => {
//             if (err) {
//               return next(new HttpError(err));
//             }
//           }
//         );

//         // Update the post data in the database, including the new thumbnail filename
//         updatedPost = await Post.findByIdAndUpdate(
//           postId,
//           { title, category, description, thumbnail: newFileName },
//           { new: true }
//         );
//       }
//     }

//     // Handle the case where the post update failed
//     if (!updatedPost) {
//       return next(new HttpError("Post update failed", 422));
//     }

//     // Send a success response with the updated post data
//     res.status(200).json(updatedPost);
//   } catch (error) {
//     // Handle any other errors during the process
//     return next(new HttpError(error));
//   }
// };

// // Delete post
// // DELETE: api/posts/:id
// // Protected

// const deletePost = async (req, res, next) => {
//   // Function to handle deleting a blog post
//   try {
//     // Extract the post ID from the request parameters
//     const postId = req.params.id;

//     // Validate if the post ID is provided
//     if (!postId) {
//       return next(new HttpError("Post not found", 404));
//     }
//     // Find the post by its ID in the database
//     const post = await Post.findById(postId);
//     // Retrieve the thumbnail filename for deletion
//     const fileName = post?.thumbnail;

//     // Check if the current user is authorized to delete the post (must be the creator)
//     if (req.user.id == post.creator) {
//       // Delete the post's thumbnail from the uploads folder
//       fs.unlink(
//         path.join(__dirname, "..", "uploads", fileName), // Construct the complete file path
//         async (err) => {
//           if (err) {
//             // Handle errors during file deletion
//             return next(new HttpError(err));
//           } else {
//             // If file deletion successful, proceed with database operations
//             await Post.findByIdAndDelete(postId);
//             // Update the user's post count after deletion
//             const currentUser = await User.findById(req.user.id);
//             const userPostCount = currentUser?.posts - 1;
//             await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
//           }
//         }
//       );
//     } else {
//       // Handle unauthorized deletion attempts
//       return next(
//         new HttpError("You are not authorized to delete this post", 401)
//       );
//     }
//     // Send a success response indicating successful deletion
//     res.json(`Post with id ${postId} deleted successfully`);
//   } catch (error) {
//     // Handle any other errors during the process
//     return next(new HttpError(error));
//   }
// };

// module.exports = {
//   createPost,
//   getPosts,
//   getPost,
//   getCatPosts,
//   getUserPosts,
//   editPost,
//   deletePost,
// };

const Post = require("../models/postModel");
const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const HttpError = require("../models/errorModel");

// Create a post
// POST: api/posts
// Protected

const createPost = async (req, res, next) => {
  try {
    let { title, category, description } = req.body;
    if (!title || !category || !description || !req.files) {
      return next(
        new HttpError("Fill in all fields and choose thumbnail", 400)
      );
    }
    const { thumbnail } = req.files;
    if (thumbnail.size > 2000000) {
      return next(new HttpError("Image size should not exceed 2mb", 400));
    }
    let fileName = thumbnail.name;
    let splittedFileName = fileName.split(".");
    let newFileName =
      splittedFileName[0] +
      uuid() +
      "." +
      splittedFileName[splittedFileName.length - 1];
    thumbnail.mv(
      path.join(__dirname, "..", "uploads", newFileName),
      async (err) => {
        if (err) {
          return next(new HttpError(err));
        } else {
          const newPost = await Post.create({
            title,
            category,
            description,
            thumbnail: newFileName,
            creator: req.user.id,
          });
          if (!newPost) {
            return next(new HttpError("Post creation failed", 422));
          }
          // find user and increase post count by 1
          const currentUser = await User.findById(req.user.id);
          const userPostCount = currentUser.posts + 1;
          await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

          res.status(201).json(newPost);
        }
      }
    );
  } catch (error) {
    return next(new HttpError(error));
  }
};

// gET ALL posts
// GET: api/posts
// Protected

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// Get a single post
// GET: api/posts/:id
// unProtected

const getPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return next(new HttpError("Post not found", 404));
    }
    res.status(200).json(post);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// Get post by category
// GET: api/posts/categories/:category
// Protected

const getCatPosts = async (req, res, next) => {
  try {
    const { category } = req.params;
    const catPosts = await Post.find({ category }).sort({ createdAt: -1 });
    res.status(200).json(catPosts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// Get posts by author
// GET: api/posts/users/:id
// unProtected

const getUserPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// Edit post
// PATCH: api/posts/:id
// Protected

const editPost = async (req, res, next) => {
  try {
    let fileName;
    let newFileName;
    let updatedPost;
    const postId = req.params.id;
    let { title, category, description } = req.body;
    if (!title || !category || description.length < 12) {
      return next(new HttpError("Fill in all fields", 422));
    }
    if (!req.files) {
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { title, category, description },
        { new: true }
      );
    } else {
      // get old post from database
      const oldPost = await Post.findById(postId);
      if (req.user.id == oldPost.creator) {
        // delete old thumbnail from uploads folder
        fs.unlink(
          path.join(__dirname, "..", "uploads", oldPost.thumbnail),
          async (err) => {
            if (err) {
              return next(new HttpError(err));
            }
          }
        );
        // upload new thumbnail
        const { thumbnail } = req.files;

        // check file size
        if (thumbnail.size > 2000000) {
          return next(new HttpError("Image size should not exceed 2mb"));
        }

        fileName = thumbnail.name;
        let splittedFileName = fileName.split(".");
        newFileName =
          splittedFileName[0] +
          uuid() +
          "." +
          splittedFileName[splittedFileName.length - 1];
        thumbnail.mv(
          path.join(__dirname, "..", "uploads", newFileName),
          async (err) => {
            if (err) {
              return next(new HttpError(err));
            }
          }
        );

        updatedPost = await Post.findByIdAndUpdate(
          postId,
          { title, category, description, thumbnail: newFileName },
          { new: true }
        );
      }
    }

    if (!updatedPost) {
      return next(new HttpError("Post update failed", 422));
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// Delete post
// DELETE: api/posts/:id
// Protected

const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    if (!postId) {
      return next(new HttpError("Post not found", 404));
    }
    const post = await Post.findById(postId);
    const fileName = post?.thumbnail;
    if (req.user.id == post.creator) {
      // delete post from our uploads folder
      fs.unlink(
        path.join(__dirname, "..", "uploads", fileName),
        async (err) => {
          if (err) {
            return next(new HttpError(err));
          } else {
            await Post.findByIdAndDelete(postId);
            // find user and decrease post count by 1
            const currentUser = await User.findById(req.user.id);
            const userPostCount = currentUser?.posts - 1;
            await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
          }
        }
      );
    } else {
      return next(
        new HttpError("You are not authorized to delete this post", 401)
      );
    }
    res.json(`Post with id ${postId} deleted successfully`);
  } catch (error) {
    return next(new HttpError(error));
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  getCatPosts,
  getUserPosts,
  editPost,
  deletePost,
};
