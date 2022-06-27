const bigPromise = require("./../middleware/bigPromise");

exports.home = bigPromise(async (req, res) => {
  res.status(200).json({
    success: true,
    greeting: "Hello from api",
  });
});

exports.homeDummy = (req, res) => {
  return res.status(200).json({
    success: true,
    greeting: "Hello from another dummy api",
  });
};
