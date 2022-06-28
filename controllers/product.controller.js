const bigPromise = require("./../middleware/bigPromise");
const product = require("../models/product.model");
const customError = require("../utils/customError");
const whereClause = require("../utils/whereClause");
const cloudinary = require("cloudinary").v2;

exports.addProduct = bigPromise(async (req, res, next) => {
  // images

  let imageArray = [];

  if (!req.files) {
    return next(new CustomError("images are required", 401));
  }

  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "product",
        }
      );

      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const products = await product.create(req.body);

  res.status(200).json({
    success: true,
    products,
  });
});

exports.getAllProduct = bigPromise(async (req, res, next) => {
  const resultPerPage = 6;
  const totalCountProduct = await product.countDocuments();

  const productsObj = new whereClause(product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base;
  const filteredProductNumber = products.length;

  //products.limit().skip()

  productsObj.pager(resultPerPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    filteredProductNumber,
    totalCountProduct,
  });
});
