const MarketUser = require("../../models/user");

// Retrieve all Customers from the database.
exports.getUserInfo = async (req, res) => {
  if (!req.query.address)
    return res.status(400).json({ error: "User-address-query-missing" });
  const address = req.query.address.toLowerCase();
  try {
    const result = await MarketUser.findOne({ address: address });
    console.log("getUserInfo", result);
    res.send(result);
  } catch (e) {
    console.log("=something went wrong ", e);
    res.status(500).send({
      message: err || "Something went wrong!",
    });
  }
};

exports.getTopUserList = async (req, res) => {
  try {
    const result = await MarketUser.find({}).sort({ followers: -1 }).limit(10);
    console.log("sorting==========================", result);
    res.send(result);
  } catch (e) {
    console.log("=something went wrong ", e);
    res.status(500).send({
      message: err || "Something went wrong!",
    });
  }
};

exports.RegisterUser = async (req, res) => {
  if (!req.body.address)
    return res.status(400).json({ error: "User-address-body-missing" });

  console.log("=========register==========", req.body);
  const address = req.body.address.toLowerCase();
  const name = req.body.name;
  const bio = req.body.bio;
  const avatar = req.body.avatar;
  const socials = req.body.socials;

  try {
    const result = await MarketUser.findOneAndUpdate(
      { address: address },
      {
        address: address,
        name: name,
        bio: bio,
        avatar: avatar,
        socials: socials,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.send(result);
  } catch (e) {
    console.error("Create user fail", e);
    res.status(500).send({ message: err || "Something went wrong" });
  }
};
