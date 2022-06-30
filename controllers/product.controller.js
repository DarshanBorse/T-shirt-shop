const bigPromise = require("./../middleware/bigPromise");
const product = require("../models/product.model");
const customError = require("../utils/customError");
const whereClause = require("../utils/whereClause");
const cloudinary = require("cloudinary").v2;

exports.addProduct = bigPromise(async (req, res, next) => {
  // images

  let imageArray = [];

  if (!req.files) {
    return next(new customError("images are required", 401));
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

exports.getOneProduct = BigPromise(async (req, res, next) => {
  const products = await product.findById(req.params.id);

  if (!products) {
    return next(new CustomError("No product found with this id", 401));
  }
  res.status(200).json({
    success: true,
    product,
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

exports.addReview = bigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const products = await product.findById(productId);

  const AlreadyReview = products.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (AlreadyReview) {
    products.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    products.reviews.push(review);
    products.numberOfReviews = product.reviews.length;
  }

  // adjust ratings

  products.ratings =
    products.reviews.reduce((acc, item) => item.rating + acc, 0) /
    products.reviews.length;

  //save

  await products.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

exports.deleteReview = bigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const products = await product.findById(productId);

  const review = products.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  const numberOfReviews = review.length;

  // adjust ratings

  products.ratings =
    products.reviews.reduce((acc, item) => item.rating + acc, 0) /
    products.reviews.length;

  //update

  await product.findByIdAndUpdate(
    productId,
    {
      review,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

exports.getOnlyReviewsForOneProduct = BigPromise(async (req, res, next) => {
  const products = await product.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews: products.reviews,
  });
});

// Admin Controllers
exports.adminGetAllProduct = bigPromise(async (req, res, next) => {
  const products = await product.find({});

  res.status(200).json({
    success: true,
    products,
  });
});

exports.adminGetOneProduct = bigPromise(async (req, res, next) => {
  const productExist = await product.findById(req.params.id);

  if (!productExist) {
    return next(new customError("No product found with this id", 401));
  }

  res.status(200).json({
    success: true,
    product: productExist,
  });
});

exports.adminUpdateOneProduct = bigPromise(async (req, res, next) => {
  let productExist = await product.findById(req.params.id);
  let imageArray = [];

  if (!productExist) {
    return next(new customError("No product found with this id", 401));
  }

  if (req.files) {
    for (let index = 0; index < productExist.photos.length; index++) {
      const res = await cloudinary.uploader.destroy(
        productExist.photos[index].id
      );
    }

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

  productExist = await product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product: productExist,
  });
});

exports.adminDeleteOneProduct = bigPromise(async (req, res, next) => {
  let productExist = await product.findById(req.params.id);

  if (!productExist) {
    return next(new customError("No product found with this id", 401));
  }

  for (let index = 0; index < productExist.photos.length; index++) {
    const res = await cloudinary.uploader.destroy(
      productExist.photos[index].id
    );
  }

  await productExist.remove();

  res.status(200).json({
    success: true,
    product: "",
  });
});
