const Item = require("../../models/item");
const Putonsale = require("../../models/PutOnSaleList");
const _ = require("lodash");

// Retrieve all Customers from the database.
exports.getItemAll = async (req, res) => {
  try {
    const result = await Item.find();
    res.send(result);
  } catch (e) {
    console.log("=something went wrong ", e);
    res.status(500).send({
      message: e || "Something went wrong!",
    });
  }
};

exports.getItem = async (req, res) => {
  // const collectionId = req.query.collectionId;
  // const tokenId = req.query.tokenId;
  if (!req.query.maker)
    return res.status(400).json({ error: "Item-maker-query-missing" });
  const maker = req.query.maker.toLowerCase();

  try {
    const result = await Item.find({ maker: maker });
    res.send(result);
  } catch (e) {
    console.log("=something went wrong ", e);
    res.status(500).send({
      message: e || "Something went wrong!",
    });
  }
};

exports.addItem = async (req, res) => {
  console.log("=========addItem==========", req.body);
  const collectionId = req.body.collectionId.toLowerCase();
  const chainId = req.body.chainId;
  const category = req.body.category;
  const subCategory = req.body.subCategory;
  const metadata = req.body.metadata;
  const tokenId = req.body.tokenId;
  const mode = req.body.mode;
  const maker = req.body.maker.toLowerCase();
  const tags = req.body.tags;

  try {
    const result = new Item({
      collectionId: collectionId,
      chainId: chainId,
      category: category,
      subCategory: subCategory,
      metadata: metadata,
      tokenId: tokenId,
      mode: mode,
      maker: maker,
      tags: tags,
    });
    await result.save();
    res.send(result);
  } catch (e) {
    console.error("Create Item fail", e);
    res.status(500).send({ message: e || "Something went wrong" });
  }
};

exports.toggleFavor = async (req, res) => {
  console.log("=========addFavor==========", req.body);
  const address = req.body.address.toLowerCase();
  const chainId = req.body.chainId;
  const tokenId = req.body.tokenId;
  const collectionId = req.body.collectionId.toLowerCase();

  try {
    const result = await Item.findOne({
      collectionId: collectionId,
      tokenId: tokenId,
      chainId: chainId,
    });
    if (!result) res.status(500).send({ message: "empty item" });
    const fav = result.likes;
    const index = _.indexOf(fav, address);
    index === -1 ? result.likes.push(address) : result.likes.splice(index, 1);
    result.save();
    res.send(index === -1 ? true : false);
  } catch (e) {
    console.error("addFavor fail", e);
    res.status(500).send({ message: e || "Something went wrong" });
  }
};

exports.isFavor = async (req, res) => {
  console.log("=========getFavor==========", req.query);
  const chainId = req.query.chainId;
  const tokenId = req.query.tokenId;
  const collectionId = req.query.collectionId.toLowerCase();
  const address = req.query.address.toLowerCase();

  try {
    const result = await Item.findOne({
      collectionId: collectionId,
      tokenId: tokenId,
      chainId: chainId,
      likes: address,
    });
    console.log(result);
    res.send(result ? true : false);
  } catch (e) {
    console.error("getFavor fail", e);
    res.status(500).send({ message: e || "Something went wrong" });
  }
};

exports.getFavorListByLiker = async (req, res) => {
  const liker = req.query.liker.toLowerCase();
  const pageNum = Math.max(0, req.query.page);
  const perPage = 10;

  console.log("=========getPutonSaleByLikes=========", req.query.liker);
  try {
    const itemList = await Item.find({ likes: liker })
      .limit(perPage)
      .skip(perPage * pageNum);
    const count = await Item.count({ likes: liker });
    let len = itemList.length;
    const putonsale = [];
    for (let i = 0; i < len; i++) {
      const result = await Putonsale.find({
        collectionId: itemList[i].collectionId,
        tokenId: itemList[i].tokenId,
        isAlive: true,
      });
      putonsale.push(result);
    }
    res.send({
      list: itemList,
      putonsale: putonsale,
      page: pageNum,
      count: count,
    });
  } catch (e) {
    console.log("getPutonSaleByLikes wrong ", e);
    res.status(500).send({
      message: e || "Something went wrong!",
    });
  }
};
