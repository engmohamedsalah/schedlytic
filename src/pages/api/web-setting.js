import customization from "./models/customization";
import userModel from "./models/userModel";
const { handleError, dbQuery, customValidator } = require("./lib/commonLib");
const mediaModel = require("./models/mediaModel");
const Customization = require("./models/customization");
const formidable = require("formidable");
const path = require('path');
const fs = require('fs');


const { removeFileFromS3, copyObject } = require('./lib/AWS-Actions');

export default async function handler(req, res) {
  try {
    if (req.method == "POST") {
      websettings(req, res);
    } else if (req.method == "GET") {
      if (req.query.action == "getweb") {
        getweb(req, res);
      }
    }
  } catch (error) {
    handleError(error, 'MediaAPI');
  }
}


const websettings = async (req, res) => {
  try {
    const { siteTitle, primaryColor, secondaryColor, bodyColor, primaryLightColor, paragraphColor, headingColor, logoPath, faviconPath } = req.body;
    console.log('req.body:', req.body)

    let customization = await dbQuery.select({
      collection: Customization,
      limit: 1
    });
    const customizationData = { siteTitle, primaryColor, secondaryColor, bodyColor, primaryLightColor, paragraphColor, headingColor,  logo: logoPath, favIcon: faviconPath };

    if (!customization) {
      await dbQuery.insert({
        collection: Customization,
        data: customizationData
      });
      return res.status(201).json({ status: true, message: 'Website settings inserted successfully', customizationData });
    } else {
      await dbQuery.update({
        collection: Customization,
        where: { _id: customization._id },
        data: customizationData
      });

      return res.status(200).json({ status: true, message: 'Website setting updated successfully ', customizationData });
    }

  } catch (error) {
    console.log({ error });
    return res.status(500).json({ status: false, message: 'Error updating or inserting website settings', error });
  }
};



const getweb = async (req, res) => {
  const data = req.query;
  try {
    const data = await dbQuery.select({
      collection: Customization,
      where: {},
      limit: 1
    })
    console.log({ data }, "Process")
    return res.status(200).json({ status: true, message: "", data })
  } catch (e) {
    console.log({ e })
    return res.status(500).json({ status: true, message: "Internal error", e })
  }
}