const Trading = require("../../models/TradingLog");

exports.addLog = async (req, res) => {
  if (!req.body.key)
    return res.status(400).json({ error: "Trading-key-body-missing" });
  if (!req.body.income)
    return res.status(400).json({ error: "Trading-income-body-missing" });
  if (!req.body.maker)
    return res.status(400).json({ error: "Trading-maker-body-missing" });
  if (!req.body.price)
    return res.status(400).json({ error: "Trading-price-body-missing" });
  if (!req.body.taker)
    return res.status(400).json({ error: "Trading-taker-body-missing" });
  if (!req.body.collectionId)
    return res.status(400).json({ error: "Trading-collectionId-body-missing" });
  if (!req.body.tokenId)
    return res.status(400).json({ error: "Trading-tokenId-body-missing" });

  const key = req.body.key;
  const income = req.body.income;
  const maker = req.body.maker.toLowerCase();
  const price = req.body.price;
  const royaltyAmount = req.body.royaltyFee;
  const taker = req.body.taker.toLowerCase();
  const royaltyAdmin = req.body.royaltyOwner.toLowerCase();
  const collectionId = req.body.collectionId;
  const tokenId = req.body.tokenId;

  console.log("==============add Log==========", req.body);

  try {
    const result = new Trading({
      key: key,
      income: income,
      taker: taker,
      price: price,
      maker: maker,
      royaltyAmount: royaltyAmount,
      royaltyAdmin: royaltyAdmin,
      collectionId: collectionId,
      tokenId: tokenId,
    });
    await result.save();
    res.send(result);
  } catch (e) {
    console.error("Create user fail", e);
    res.status(500).send({ message: err || "Something went wrong" });
  }
};

exports.getLogs = async (req, res) => {
  if (!req.query.maker)
    return res.status(400).json({ error: "Trading-maker-query-missing" });
  if (!req.query.taker)
    return res.status(400).json({ error: "Trading-taker-query-missing" });

  const maker = req.query.maker.toLowerCase();
  const taker = req.query.taker.toLowerCase();
  console.log("maker==========", maker);
  try {
    if (maker) {
      const result = await Trading.find({ maker: maker });
      console.log("result==========", result);
      res.send(result);
    }
    if (taker) {
      const result = await Trading.find({ taker: taker });
      console.log("result==========", result);
      res.send(result);
    }
  } catch (e) {
    console.error("get logs fail", e);
    res.status(500).send({ message: err || "Something went wrong" });
  }
};

exports.updateLog = async (req, res) => {
  if (!req.body.log_id)
    return res.status(400).json({ error: "Trading-log_id-body-missing" });
  if (!req.body.isCliam)
    return res.status(400).json({ error: "Trading-isCliam-body-missing" });
  console.log("req:", req.body);
  const log_id = req.body.log_id;
  const isCliam = req.body.isCliam;

  try {
    const resOne = await Trading.findOne({ _id: log_id });
    resOne.isCliam = isCliam;
    const result = await resOne.save();
    res.send(result);
  } catch (e) {
    console.error("update logs fail", e);
    res.status(500).send({ message: err || "Something went wrong" });
  }
};

exports.cancelBid = async (req, res) => {
  try {
  } catch (e) {
    console.error("cancelList fail", e);
    res.status(500).send({ message: err || "Something went wrong" });
  }
};
