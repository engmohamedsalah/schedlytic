import planModel from "./models/planModel";

const {
  handleError,
  dbQuery,
  customValidator,
} = require("./lib/commonLib");




export default async function handler(req, res) {
  if (req.method === "GET") {
    getPlanById(req, res)
  }
}


const getPlanById = async (req, res) => {
  const planId = req.query.id;
  console.log('planId', planId)
  try {
    const data = await dbQuery.select({
      collection: planModel,
      where: { id: planId },
      limit: 1
    })
    if (!data) {
      res.status(400).json({ status: false, message: "Plan not found" })
    } else {
      console.log({ data }, "opppp");
      return res.status(200).json({ status: true, message: "", data });
    }
  } catch (e) {
    console.log({ e });
    res.status(500).json({ status: false, message: "Internal server error", e })

  }
}







