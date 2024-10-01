import { User } from "../../Models/User Model/User.Model.js";

const SignUpUser = async (req, res) => {
  try {
    console.log("Received signup request");
    const { username, email, password } = req.body;
    console.log("Received data:", { username, email, password: "***" });

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields",
        success: false,
      });
    }

    const userExists = await User.findOne({ loginEmail: email });

    if (userExists) {
      console.log("User already exists with email:", email);
      return res.status(409).json({
        message: "User already exists with this email",
        success: false,
      });
    }

    const user = await User.create({
      username,
      loginEmail: email,
      password, // Ensure you're hashing this password before saving
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      console.error("Failed to retrieve created user");
      return res.status(500).json({
        message: "Failed to create user. Please try again.",
        success: false,
      });
    }

    console.log("User created successfully:", createdUser._id);
    return res.status(201).json({
      message: "Signup Successful",
      success: true,
      user: createdUser,
    });
  } catch (error) {
    console.error("Error in SignUpUser:", error);
    return res.status(500).json({
      message: "An unexpected error occurred. Please try again.",
      success: false,
    });
  }
};

const loginUser = async (req, res) => {
  const { loginEmail, password } = req.body;
  console.log(loginEmail, password);

  const user = await User.findOne({
    $or: [{ loginEmail }],
  });
  if (!user) {
    return res.status(200).json({
      message: "Account not exist",
      success: false,
    });
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    return res.status(200).json({
      message: "Wrong Cradentials",
      success: false,
    });
  }

  const { accesstoken, refreshtoken } = await GenerateAccessAndRefreshTokens(
    user._id
  );

  // we are again fetching data of user becouse previous data does not have refresh token , thats why we need updated user
  const loggedinuser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );

  // whenever we send cookies we always design some option like this , so that no one can modified our cookies except on server
  const options = {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };

  return res
    .status(200)
    .cookie("accesstoken", accesstoken, options)
    .cookie("refreshtoken", refreshtoken, options)
    .json({
      message: "User Logged In  Successfully",
      user: loggedinuser,
      success: true,
      accesstoken,
      refreshtoken,
    });
};

const GenerateAccessAndRefreshTokens = async (userid) => {
  try {
    const user = await User.findById(userid);
    const accesstoken = user.generateAccessToken();
    const refreshtoken = user.generateRefreshToken();

    user.refreshToken = refreshtoken;
    await user.save({ validateBeforeSave: false });

    return { accesstoken, refreshtoken };
  } catch (error) {
    console.log("Error is:", error);
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh tokne "
    );
  }
};

export { loginUser, SignUpUser };
