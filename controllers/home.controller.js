exports.home = (req, res) => {
  return res.status(200).json({
    success: true,
    greeting: "Hello from api",
  });
};

exports.homeDummy = (req, res) => {
  return res.status(200).json({
    success: true,
    greeting: "Hello from another dummy api",
  });
};
