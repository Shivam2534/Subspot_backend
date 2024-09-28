const loginUser = async (req, res) => {
  console.log("requested at loginUser controller");

  return res.json({
    msg: "Route working perfect for login",
  });
};

const SignUpUser = async (req, res) => {
  console.log("requested at SignUpUser controller");
  console.log(req.body);

  return res.json({
    msg: "Route working perfect for signup",
    data: req.body
  });
};

export { loginUser, SignUpUser };
