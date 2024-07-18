const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const Item = require("../models/item");
const { body, validationResult } = require("express-validator");

// Display list of all categories.
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();

  res.render("category_list", {
    title: "Category list",
    category_list: allCategories,
  });
});

// Display detail page for a specific category.
exports.category_detail = asyncHandler(async (req, res, next) => {
  const [category, Items] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  res.render("category_detail", {
    title: "Category detail",
    category: category,
    item_list: Items,
  });
});

// Display category create form on GET.
exports.category_create_get = asyncHandler(async (req, res, next) => {
  res.render("category_form", {
    title: "Create new category",
  });
});

// Handle category create on POST.
exports.category_create_post = [
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),

  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request with sanitized data
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Category object with escaped and trimmed data.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });
    console.log(category);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.render("category_form", {
        title: "Create new category",
        category: category,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save category.
      await category.save();
      res.redirect(category.url);
    }
  }),
];

// Display category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of category and all their items (in parallel)
  const [category, allItems] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (category === null) {
    // No results.
    res.redirect("/inventory/categories");
  }

  res.render("category_delete", {
    title: "Delete Category",
    category: category,
    items: allItems,
  });
});

// Handle category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of category and all their items (in parallel)
  const [category, allItems] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (allItems.length > 0) {
    // Category has items. Render in same way as for GET route.
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      items: allItems,
    });
    return;
  } else {
    // Category has no items. Delete object and redirect to the list of categories.
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect("/inventory/categories");
  }
});

// Display category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (category === null) {
    // No results.
    const err = new Error("Instance not found");
    err.status = 404;
    return next(err);
  }
  res.render("category_form", {
    title: "Update category",
    category: category,
  });
});

// Handle category update on POST.
exports.category_update_post = [
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),

  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request with sanitized data
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Category object with escaped and trimmed data.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Create new category",
        category: category,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save category.
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        category,
        {}
      );
      res.redirect(updatedCategory.url);
    }
  }),
];
