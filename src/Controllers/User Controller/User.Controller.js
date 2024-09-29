import { User } from "../../Models/User Model/User.Model.js";

const SignUpUser = async (req, res) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);

  const userexisted = await User.findOne({
    $or: [{ loginEmail: email }],
  });

  if (userexisted) {
    console.log("user already exist");
    return res.status(200).json({
      message: "User already exist with this email",
      success: false,
    });
  }

  const user = await User.create({
    username,
    loginEmail: email,
    password,
  });

  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createduser) {
    return res.status(401).json({
      message: "Something went wrong try to signup again!!",
      success: false,
    });
  }

  return res.status(200).json({
    message: "Signup Successfully",
    success: true,
  });
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
