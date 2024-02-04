const Collection = require("../../models/collection");

// Retrieve all Customers from the database.
exports.getCollectionByAddress = async (req, res) => {
  if (!req.query.address)
    return res.status(400).json({ error: "collection-address-query-missing" });
  const address = req.query.address.toLowerCase();
  try {
    const result = await Collection.find({ owner: address });
    res.send(result);
  } catch (e) {
    console.log("=something went wrong ", e);
    res.status(500).send({
      message: err || "Something went wrong!",
    });
  }
};

exports.addCollection = async (req, res) => {
  console.log("=========addCollection==========", req.body);
  if (!req.body.collectionId)
    return res
      .status(400)
      .json({ error: "collection-collectionId-body-missing" });
  if (!req.body.chainId)
    return res.status(400).json({ error: "collection-chainId-body-missing" });
  if (!req.body.category)
    return res.status(400).json({ error: "collection-category-body-missing" });
  if (!req.body.metadata)
    return res.status(400).json({ error: "collection-metadata-body-missing" });
  if (!req.body.socials)
    return res.status(400).json({ error: "collection-socials-body-missing" });
  if (!req.body.owner)
    return res.status(400).json({ error: "collection-owner-body-missing" });

  const collectionId = req.body.collectionId.toLowerCase();
  const chainId = req.body.chainId;
  const category = req.body.category;
  const metadata = req.body.metadata;
  const socials = req.body.socials;
  const owner = req.body.owner.toLowerCase();

  try {
    const result = await Collection.findOneAndUpdate(
      { collectionId: collectionId },
      {
        collectionId: collectionId,
        chainId: chainId,
        category: category,
        metadata: metadata,
        socials: socials,
        owner: owner,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.send(result);
  } catch (e) {
    console.error("Create user fail", e);
    res.status(500).send({ message: err || "Something went wrong" });
  }
};
