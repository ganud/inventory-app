const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

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
  const allItems = await Item.find()
    .sort({ name: 1 })
    .populate("category")
    .exec();
  console.log(allItems);
  res.render("item_list", {
    title: "Item list",
    item_list: allItems,
  });
});

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate("category").exec();
  res.render("item_detail", {
    title: "Item detail",
    item: item,
  });
});

// Display item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  // All categories, to be selected later for the item
  const allCategories = await Category.find().sort({ name: 1 }).exec();
  res.render("item_form", {
    title: "Create Item",
    category_list: allCategories,
  });
});

// Handle item create on POST.
exports.item_create_post = [
  // Validate and sanitize fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("stock", "Stock must be an integer.").trim().isInt().escape(),
  body("category", "Category must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must be a number")
    .trim()
    .isFloat()
    .isLength({ min: 1 })
    .escape(),

  // Process request with sanitized data
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const allCategories = await Category.find().sort({ name: 1 }).exec();
    const errors = validationResult(req);

    // Create a Item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      stock: req.body.stock,
      category: req.body.category,
      price: req.body.price,
    });
    console.log(item);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.render("item_form", {
        title: "Create Item",
        category_list: allCategories,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save item.
      await item.save();
      res.redirect(item.url);
    }
  }),
];

// Display item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();
  if (item === null) {
    // No results.
    res.redirect("/inventory/items");
  }
  res.render("item_delete", {
    title: "Delete Item",
    item: item,
  });
});

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  await Item.findByIdAndDelete(req.body.itemid);
  res.redirect("/inventory/items");
});

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  // All categories, to be selected later for the item
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).exec(),
    Category.find().sort({ name: 1 }).exec(),
  ]);
  res.render("item_form", {
    title: "Create Item",
    category_list: allCategories,
    item: item,
  });
});

// Handle item update on POST.
exports.item_update_post = [
  // Validate and sanitize fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("stock", "Stock must be an integer.").trim().isInt().escape(),
  body("category", "Category must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must be a number")
    .trim()
    .isFloat()
    .isLength({ min: 1 })
    .escape(),

  // Process request with sanitized data
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const allCategories = await Category.find().sort({ name: 1 }).exec();
    const errors = validationResult(req);

    // Create a Item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      stock: req.body.stock,
      category: req.body.category,
      price: req.body.price,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.render("item_form", {
        title: "Update Item",
        category_list: allCategories,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save item.
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      res.redirect(updatedItem.url);
    }
  }),
];
