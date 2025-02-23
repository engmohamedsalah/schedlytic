const {
  handleError,
  dbQuery,
  customValidator,
} = require("./lib/commonLib");
const mongoose = require('mongoose');
const postModel = require("./models/postModel");

export default function handler(req, res) {
  if (req.method === "GET") {
    getdraft(req, res);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
const getdraft = async (req, res) => {
  customValidator(
    { data: req.params },
    req,
    res,
    async (validateResp) => {
      let { keys, page, limit, keyword, sort, target, type } = req.query;

      let where = {};
      if (validateResp.authData.role === 'User') {
        where.userId = validateResp.authData.id;
      }

      if (keyword && keyword.trim() != '') {
        where["$or"] = [
          { 'title': { $regex: new RegExp(keyword, "i") }, },
        ]
      }
      where.type = "draft"
      if (target) {
        where._id = target
        limit = 1
        page = 1
      }

      try {
        const fetchDrafts = await dbQuery.select({
          collection: postModel,
          where: where,
          limit: limit,
          page: page,
        });
        const count = await postModel.countDocuments(where)
        res.status(200).json({ status: true, message: '', data: fetchDrafts, totalRecords: count });
      } catch (error) {
        res.status(500).json({ status: false, message: error.message });
      }
    }
  );
};
