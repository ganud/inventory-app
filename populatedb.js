#! /usr/bin/env node

console.log(
  'This script populates some sample inventory items and categories to the database. Specified database as argument - e.g.: node populatedb "{CONNECTION_URI}'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Item = require("./models/item");
const Category = require("./models/category");

const items = [];
const categories = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

// Script to populate database with test items
async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createCategories();
  await createItems();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function categoryCreate(index, name, description) {
  const category = new Category({ name: name, description: description });
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function createCategories() {
  console.log("Adding categories");
  await Promise.all([
    categoryCreate(0, "GPUs", "Render computer graphics"),
    categoryCreate(1, "CPUs", "Render computer logic"),
    categoryCreate(2, "Cases", "Hold PC components"),
  ]);
}

async function itemCreate(index, name, description, category, price, stock) {
  const item = new Item({
    name: name,
    description: description,
    category: category,
    price: price,
    stock: stock,
  });
  await item.save();
  items[index] = item;
  console.log(`Added item: ${name}`);
}

async function createItems() {
  console.log("Adding items");
  await Promise.all([
    itemCreate(
      0,
      "GeForce RTX 4090",
      "The biggest GPU",
      categories[0],
      1700,
      2
    ),
    itemCreate(
      1,
      "AMD Ryzen 7 7800X3D ",
      "Top gaming CPU",
      categories[1],
      350,
      2
    ),
    itemCreate(2, "Test Case 1", "This is a PC case", categories[2], 123, 1),
  ]);
}
