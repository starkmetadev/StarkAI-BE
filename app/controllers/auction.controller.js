const Auction = require("../../models/AuctionList");

exports.addAuctionList = async (req, res) => {
  if (!req.body.key)
    return res.status(400).json({ error: "auction-key-body-missing" });
  if (!req.body.chainId)
    return res.status(400).json({ error: "auction-chainId-body-missing" });
  if (!req.body.price)
    return res.status(400).json({ error: "auction-price-body-missing" });
  if (!req.body.taker)
    return res.status(400).json({ error: "auction-taker-body-missing" });
  if (!req.body.collectionId)
    return res.status(400).json({ error: "auction-collectionId-body-missing" });
  if (!req.body.tokenId)
    return res.status(400).json({ error: "auction-tokenId-body-missing" });

  const key = req.body.key;
  const chainId = req.body.chainId;
  const price = req.body.price;
  const taker = req.body.taker.toLowerCase();
  const collectionId = req.body.collectionId.toLowerCase();
  const tokenId = req.body.tokenId.toLowerCase();

  console.log("addAuction", req.body);

  try {
    const result = await Auction.findOneAndUpdate(
      { key: key, taker: taker },
      {
        chainId: chainId,
        key: key,
        taker: taker,
        price: price,
        collectionId: collectionId,
        tokenId: tokenId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.send(result);
  } catch (e) {
    console.error("Create user fail", e);
    res.status(500).send({ message: err || "Something went wrong" });
  }
};

exports.cancelBid = async (req, res) => {
  if (!req.body.key)
    return res.status(400).json({ error: "auction-key-body-missing" });
  if (!req.body.taker)
    return res.status(400).json({ error: "auction-taker-body-missing" });
  const key = req.body.key;
  const taker = req.body.taker.toLowerCase();
  try {
    const result = await Auction.findOneAndDelete({ key: key, taker: taker });
    res.send(result);
  } catch (e) {
    console.error("cancelList fail", e);
    res.status(500).send({ message: err || "Something went wrong" });
  }
};
