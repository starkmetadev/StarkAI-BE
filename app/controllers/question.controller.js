const Questions = require("../../models/question");
const Putonsale = require("../../models/PutOnSaleList");
const MarketUser = require("../../models/user");
const Item = require("../../models/item");

// Retrieve all Customers from the database.
exports.getQuestions = async (req, res) => {
  if (!req.query.product_id)
    return res.status(400).json({ error: "Question-product_id-query-missing" });
  const product_id = req.query.product_id;
  const perPage = Math.max(0, req.query.limit);
  const pageNum = Math.max(0, req.query.page);
  try {
    const itmCnt = await Questions.count({ product_id: product_id });
    // const result = await Reviews.find({product_id: product_id}).limit(perPage).skip(perPage * pageNum)
    const result = await Questions.find({ product_id: product_id });
    console.log("data:", result);
    res.send({
      data: result,
      totalCount: itmCnt,
      current_page: pageNum,
      from: 1,
      last_page: Math.ceil(itmCnt / perPage),
      per_page: perPage,
      to: Math.ceil(itmCnt / perPage),
      total: itmCnt,
    });
  } catch (e) {
    console.log("=something went wrong ", e);
    res.status(500).send({
      message: err || "Something went wrong!",
    });
  }
};

exports.getMyQuestion = async (req, res) => {
  if (!req.query.user_id)
    return res.status(400).json({ error: "Question-user_id-query-missing" });
  const user_id = req.query.maker.toLowerCase();
  const perPage = Math.max(0, req.query.limit);
  const pageNum = Math.max(0, req.query.page);
  try {
    const itmCnt = await Questions.count({});
    // const result = await Reviews.find({product_id: product_id}).limit(perPage).skip(perPage * pageNum)
    const result = await Questions.find({ user_id: user_id });
    const myQuestionInfo = [];
    for (let i = 0; i < result.length; i++) {
      const product = await Putonsale.findOne({ _id: result[i].product_id });
      if (product) {
        const user = await MarketUser.findOne({
          address: product.maker,
        }).select(["name", "avatar", "address"]);
        const item = await Item.findOne({
          collectionId: product.collectionId,
          tokenId: product.tokenId,
        });
        myQuestionInfo.push({
          answer: result[i]?.answer,
          my_feedback: result[i]?.my_feedback,
          negative_feedbacks_count: result[i]?.negative_feedbacks_count,
          positive_feedbacks_count: result[i]?.positive_feedbacks_count,
          product_id: result[i]?.product_id,
          question: result[i]?.question,
          product: {
            username: user.name,
            avatar: user.avatar,
            address: user.address,
            collectionLikes: item?.likes,
            metadata: item?.metadata,
            mode: item?.mode,
            key: product.key,
            maker: product.maker,
            chainId: product.chainId,
            tokenId: product.tokenId,
            royaltyFee: product.royaltyFee,
            admin: product.admin,
            price: product.price,
            category: product.category,
            isAlive: product.isAlive,
            collectionId: product.collectionId,
          },
        });
      }
    }
    // const result = await Questions.aggregate([
    // 	{ "$lookup": {
    // 		"from": "putonsalelists",
    // 		"let": { "id": "$product_id" },
    // 		"pipeline": [
    // 		{ "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, "$$id"] }}}
    // 		],
    // 		"as": "product"
    // 	}}
    // ])
    // console.log("data:", dddd);
    res.send({
      data: myQuestionInfo,
      totalCount: itmCnt,
      current_page: pageNum,
      from: 1,
      last_page: Math.ceil(itmCnt / perPage),
      per_page: perPage,
      to: Math.ceil(itmCnt / perPage),
      total: itmCnt,
    });
  } catch (e) {
    console.log("=something went wrong ", e);
    res.status(500).send({
      message: err || "Something went wrong!",
    });
  }
};

exports.addQuestion = async (req, res) => {
  console.log("=========addQuestion==========", req.body);
  if (!req.body.product_id)
    return res.status(400).json({ error: "Question-product_id-body-missing" });
  if (!req.body.user_id)
    return res.status(400).json({ error: "Question-user_id-body-missing" });
  if (!req.body.product_id)
    return res.status(400).json({ error: "Question-product_id-body-missing" });
  if (!req.body.question)
    return res.status(400).json({ error: "Question-question-body-missing" });

  const product_id = req.body.product_id;
  const user_id = req.body.maker;
  const abusive_reports_count = req.body.abusive_reports_count;
  const answer = req.body.answer;
  const my_feedback = req.body.my_feedback;
  const negative_feedbacks_count = req.body.negative_feedbacks_count;
  const positive_feedbacks_count = req.body.positive_feedbacks_count;
  const question = req.body.question;

  try {
    const result = new Questions({
      product_id: product_id,
      user_id: user_id,
      abusive_reports_count: abusive_reports_count,
      answer: answer,
      my_feedback: my_feedback,
      negative_feedbacks_count: negative_feedbacks_count,
      positive_feedbacks_count: positive_feedbacks_count,
      question: question,
    });
    await result.save();
    res.send(result);
  } catch (e) {
    console.error("Create question fail", e);
    res.status(500).send({ message: err || "Something went wrong" });
  }
};
