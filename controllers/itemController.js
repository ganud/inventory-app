const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  // Get quantity data to display on homepage
  const [numItems, numCategories, numItemsinStock] = await Promise.all([
    Category.countDocuments({}).exec(),
    Item.countDocuments({}).exec(),
    // Sum the total stock
    Item.aggregate([
      {
        $group: {
          _id: null,
          totalQty: { $sum: "$stock" },
        },
      },
    ]).exec(),
  ]);
  console.log(numItemsinStock);
  res.render("index", {
    title: "Inventory App Home",
    item_count: numItems,
    category_count: numCategories,
    stock_count: numItemsinStock[0].totalQty, // Extract total quantity from aggregate output
  });
});

// Display list of all items.
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find().sort({ name: 1 }).exec();

  res.render("item_list", {
    title: "Item list",
    item_list: allItems,
  });
});

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();
  res.render("item_detail", {
    title: "Item detail",
    item: item,
  });
});

// Display item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: item create GET");
});

// Handle item create on POST.
exports.item_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: item create POST");
});

// Display item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: item delete GET");
});

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: item delete POST");
});

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: item update GET");
});

// Handle item update on POST.
exports.item_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: item update POST");
});
