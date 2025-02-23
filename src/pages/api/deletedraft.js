

const {
  handleError,
  dbQuery,
  customValidator,
} = require("./lib/commonLib");
const mongoose = require('mongoose');
const postModel = require("./models/postModel");

export default function handler(req, res) {
  if (req.method === "DELETE") {
    deleteDraft(req, res);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}


const deleteDraft = async (req, res) => {
  customValidator(
    {},
    req,
    res,
    async (validateResp) => {
      const id = req.query.id;
      console.log('req.query.id', req.query.id)
      try {
        let d1 = await dbQuery.delete({
          collection: postModel,
          where: { _id: id }
        })
        console.log('d1', d1);
        return res.status(200).json({ status: true, message: "Drafts deleted successfully", d1 })

      } catch (error) {
        res.status(500).json({ status: false, message: error.message })
      }
    }
  );
};