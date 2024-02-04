const Message = require("../../models/message");

// Retrieve all Customers from the database.
exports.getMessages = async (req, res) => {
  if (!req.query.product_id)
    return res.status(400).json({ error: "Message-product_id-query-missing" });
  if (!req.query.to)
    return res.status(400).json({ error: "Message-to-query-missing" });
  const product_id = req.query.product_id;
  const to = req.query.to;
  console.log("product_id:", product_id);
  console.log("to:", to);
  try {
    const result = await Message.find({ product_id: product_id, to: to });
    res.send(result);
  } catch (e) {
    console.log("=something went wrong ", e);
    res.status(500).send({
      message: err || "Something went wrong!",
    });
  }
};

exports.addMessage = async (req, res) => {
  if (!req.body.product_id)
    return res.status(400).json({ error: "Message-product_id-body-missing" });
  if (!req.body.from)
    return res.status(400).json({ error: "Message-from-body-missing" });
  if (!req.body.to)
    return res.status(400).json({ error: "Message-to-body-missing" });
  if (!req.body.comment)
    return res.status(400).json({ error: "Message-comment-body-missing" });
  const product_id = req.body.product_id;
  const from = req.body.from;
  const to = req.body.to;
  const comment = req.body.comment;

  try {
    const result = new Message({
      product_id: product_id,
      from: from,
      to: to,
      comment: comment,
    });
    await result.save();
    res.send(result);
  } catch (e) {
    console.error("create message fail", e);
    res.status(500).send({ message: err || "Something went wrong" });
  }
};
