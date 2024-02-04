const Putonsale = require("../../models/PutOnSaleList");
const Item = require("../../models/item");
const Auction = require("../../models/AuctionList");
const MarketUser = require("../../models/user");
const _ = require("lodash");

// Retrieve all Customers from the database.
exports.getPutonsale = async (req, res) => {
  if (!req.query.collectionId)
    return res
      .status(400)
      .json({ error: "PutonSale-collectionId-query-missing" });
  if (!req.query.tokenId)
    return res.status(400).json({ error: "PutonSale-tokenId-query-missing" });
  if (!req.query.maker)
    return res.status(400).json({ error: "PutonSale-maker-query-missing" });
  if (!req.query.chainId)
    return res.status(400).json({ error: "PutonSale-chainId-query-missing" });

  const collectionId = req.query.collectionId.toLowerCase();
  const tokenId = req.query.tokenId;
  const maker = req.query.maker.toLowerCase();
  const chainId = req.query.chainId;
  try {
    const result = await Putonsale.findOne({
      collectionId: collectionId,
      tokenId: tokenId,
      maker: maker,
      chainId: chainId,
    });
    const fav = await Item.find({
      collectionId: collectionId,
      tokenId: tokenId,
      chainId: chainId,
    });
    res.send({ list: result, itemInfo: fav });
  } catch (e) {
    console.log("=something went wrong ", e);
    res.status(500).send({
      message: err || "Something went wrong!",
    });
  }
};

exports.getPutonsaleAll = async (req, res) => {
  try {
    const result = await Putonsale.find();
    res.send(result);
  } catch (e) {
    console.log("=something went wrong ", e);
    res.status(500).send({
      message: err || "Something went wrong!",
    });
  }
};

exports.getPutonsaleByMaker = async (req, res) => {
  if (!req.query.maker)
    return res.status(400).json({ error: "PutonSale-maker-query-missing" });

  const maker = req.query.maker.toLowerCase();
  console.log(maker);
  try {
    const result = await Putonsale.find({
      maker: maker.toLowerCase(),
      isAlive: true,
    });
    console.log(result);
    const itemInfo = [];
    await Promise.all(
      _.map(result, async (item) => {
        const fav = await Item.findOne({
          collectionId: item?.collectionId.toLowerCase(),
          tokenId: item?.tokenId,
          chainId: item?.chainId,
        });
        itemInfo.push({
          category: fav.category,
          metadata: fav.metadata,
          likes: fav.likes,
          mode: fav.mode,
        });
      })
    );

    res.send({ list: result, itemInfo: itemInfo });
  } catch (e) {
    console.log("=something went wrong ", e);
    res.status(500).send({
      message: err || "Something went wrong!",
    });
  }
};

exports.getPutonsalePageNum = async (req, res) => {
  const pageNum = Math.max(0, req.query.page);
  const perPage = 12;
  const source = req.query.source;
  const status = req.query.status;
  const tag = req.query.tag;
  const category = req.query.category;
  const nftType = req.query.nftType;
  const nftMode = req.query.nftMode;
  const volume = req.query.volume;
  const price = req.query.price;
  const listing = req.query.listing;

  let query = {};
  if (
    typeof category !== "undefined" &&
    category !== "All" &&
    category !== ""
  ) {
    query = {
      ...query,
      category: category,
    };
  }
  if (typeof tag !== "undefined" && tag !== "All" && tag !== "") {
    query = {
      ...query,
      tag: tag,
    };
  }

  console.log("===getPutonsalePageNum===", req.query);
  try {
    const itmCnt = await Putonsale.count({ isAlive: { $ne: false } });
    // const result = await Putonsale.find({isAlive: { $ne: false }, ...query}).limit(perPage).skip(perPage * pageNum)
    const result = await Putonsale.find({ isAlive: { $ne: false }, ...query });
    // console.log("**************itmCnt***", itmCnt)
    const relationInfo = [];
    for (let i = 0; i < result.length; i++) {
      // console.log("*****************result[i]", result[i])
      const user = await MarketUser.findOne({
        address: result[i].maker,
      }).select(["name", "avatar", "address"]);
      // console.log("===user",user)
      const item = await Item.findOne({
        collectionId: result[i].collectionId,
        tokenId: result[i].tokenId,
      });
      // console.log("------------",item)
      relationInfo.push({
        username: user.name,
        avatar: user.avatar,
        address: user.address,
        collectionLikes: item?.likes,
        metadata: item?.metadata,
        key: result[i].key,
        maker: result[i].maker,
        chainId: result[i].chainId,
        tokenId: result[i].tokenId,
        royaltyFee: result[i].royaltyFee,
        admin: result[i].admin,
        price: result[i].price,
        category: result[i].category,
        isAlive: result[i].isAlive,
        collectionId: result[i].collectionId,
      });
    }
    let filerResult = relationInfo;
    if (typeof nftMode !== "undefined" && nftMode !== "all" && nftMode !== "") {
      filerResult = filerResult.filter((el) => el.mode === Number(nftMode));
    }
    if (typeof nftType !== "undefined" && nftType !== "all" && nftType !== "") {
      filerResult = filerResult.filter(
        (el) => el.fnft_Type === Number(nftType)
      );
    }

    const itmCnt_1 = filerResult.length;
    filerResult = filerResult.slice(pageNum * perPage, (pageNum + 1) * perPage);
    res.send({
      data: filerResult,
      total: itmCnt_1,
      current_page: pageNum,
      first_page_url: "",
      from: 0,
      last_page: Math.floor(itmCnt_1 / perPage),
      last_page_url: "",
      links: [],
      path: "",
      per_page: perPage,
      to: 0,
    });
  } catch (e) {
    console.error("Create user fail", e);
    res.status(500).send({ message: err || "Something went wrong" });
  }
};

exports.addPutonsale = async (req, res) => {
  if (!req.body.key)
    return res.status(400).json({ error: "PutonSale-key-body-missing" });
  if (!req.body.collectionId)
    return res
      .status(400)
      .json({ error: "PutonSale-collectionId-body-missing" });
  if (!req.body.maker)
    return res.status(400).json({ error: "PutonSale-maker-body-missing" });
  if (!req.body.chainId)
    return res.status(400).json({ error: "PutonSale-chainId-body-missing" });
  if (!req.body.tokenId)
    return res.status(400).json({ error: "PutonSale-tokenId-body-missing" });
  if (!req.body.price)
    return res.status(400).json({ error: "PutonSale-price-body-missing" });

  const key = req.body.key;
  const collectionId = req.body.collectionId.toLowerCase();
  const maker = req.body.maker.toLowerCase();
  const chainId = req.body.chainId;
  const tokenId = req.body.tokenId;
  const royaltyFee = req.body.royaltyFee;
  const price = req.body.price;
  const category = req.body.category;
  const metadata = req.body.metadata;
  const tags = req.body.tags;
  console.log("----addPutonsale------", req.body);

  try {
    const result = await Putonsale.findOneAndUpdate(
      {
        $or: [
          { collectionId: collectionId, tokenId: tokenId, maker: maker },
          { key: key },
        ],
      },
      {
        collectionId: collectionId,
        chainId: chainId,
        key: key,
        tokenId: tokenId,
        royaltyFee: royaltyFee,
        price: price,
        maker: maker,
        category: category,
        isAlive: true,
        tags: tags,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await Item.findOneAndUpdate(
      { collectionId: collectionId, chainId: chainId, tokenId: tokenId },
      {
        collectionId: collectionId,
        chainId: chainId,
        tokenId: tokenId,
        category: category,
        metadata: metadata,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.send(result);
  } catch (e) {
    console.error("Create user fail", e);
    res.status(500).send({ message: e || "Something went wrong" });
  }
};

exports.cancelList = async (req, res) => {
  if (!req.body.key)
    return res.status(400).json({ error: "PutonSale-key-body-missing" });
  const key = req.body.key;
  try {
    const resOne = await Putonsale.findOne({ key: key });
    resOne.isAlive = false;
    const result = await resOne.save();
    res.send(result);
  } catch (e) {
    console.error("cancelList fail", e);
    res.status(500).send({ message: err || "Something went wrong" });
  }
};

exports.updatePutonSale = async (req, res) => {
  if (!req.body.key)
    return res.status(400).json({ error: "PutonSale-key-body-missing" });
  console.log("====update puton sale====");
  const key = req.body.key;
  try {
    const resOne = await Putonsale.findOne({ key: key });
    resOne.isAlive = false;
    const result = await resOne.save();
    res.send(result);
  } catch (e) {
    console.error("cancelList fail", e);
    res.status(500).send({ message: err || "Something went wrong" });
  }
};

exports.getPutonlist = async (req, res) => {
  if (!req.query.key)
    return res.status(400).json({ error: "PutonSale-key-query-missing" });
  if (!req.query.collectionId)
    return res
      .status(400)
      .json({ error: "PutonSale-collectionId-query-missing" });
  if (!req.query.tokenId)
    return res.status(400).json({ error: "PutonSale-tokenId-query-missing" });
  if (!req.query.maker)
    return res.status(400).json({ error: "PutonSale-maker-query-missing" });
  if (!req.query.chainId)
    return res.status(400).json({ error: "PutonSale-chainId-query-missing" });

  const key = req.query.key;
  const collectionId = req.query.collectionId.toLowerCase();
  const tokenId = req.query.tokenId;
  const chainId = req.query.chainId;
  const _maker = req.query.maker.toLowerCase();

  console.log("=========getPutonlist=========", req.query);
  try {
    const result = key
      ? await Putonsale.findOne({ key: key })
      : await Putonsale.findOne({
          collectionId: collectionId,
          tokenId: tokenId,
          maker: _maker,
        });
    const fav = await Item.findOne({
      collectionId: collectionId,
      tokenId: tokenId,
      chainId: chainId,
    });
    const auction = await Auction.find({ key: key });
    const auctionList = [];
    console.log(result);
    const maker = await MarketUser.findOne({ address: _maker }).select([
      "name",
      "avatar",
      "socials",
      "address",
    ]);
    for (let i = 0; i < auction.length; i++) {
      const taker = auction[i].taker;
      const userRes = await MarketUser.findOne({ address: taker }).select([
        "name",
        "avatar",
      ]);
      auctionList.push({
        name: userRes.name,
        taker: taker,
        price: auction[i].price,
        avatar: userRes.avatar,
        auctionTime: auction[i].updatedAt,
      });
    }
    console.log(fav);
    res.send({
      list: result,
      itemInfo: fav,
      auction: auctionList,
      maker: maker,
    });
  } catch (e) {
    console.log("getPutonlist wrong ", e);
    res.status(500).send({
      message: e || "Something went wrong!",
    });
  }
};
