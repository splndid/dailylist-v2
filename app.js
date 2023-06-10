const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// for using EJS Template.
app.set("view engine", "ejs");

// for rendering static files.
app.use(express.static("public"));

// To use body parser.
app.use(bodyParser.urlencoded({ extended: true }));

// creating a database
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
mongoose.connect("mongodb+srv://admin-spln:test123@cluster0.atuqscy.mongodb.net/todolistDB");

// create a schema
const itemSchema = { name: String };

// create a model
const Item = mongoose.model("Item", itemSchema);

// create a schema for dynamic routing
const listSchema = { name: String, items: [itemSchema] };

// create a model
const List = mongoose.model("List", listSchema);

app.get("/", async (req, res) => {
  try {
    const items = await Item.find({});
    res.render("list", { listTitle: "Today", newListItems: items });
  } catch (err) {
    console.log(err);
  }
});

app.post("/", async (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({ name: itemName });

  try {
    if (listName === "Today") {
      await item.save();
      res.redirect("/");
    } else {
      let customList = await List.findOne({ name: listName });
      if (!customList) {
        customList = new List({
          name: listName,
          items: [item]
        });
      } else {
        customList.items.push(item);
      }
      await customList.save();
      res.redirect("/" + listName);
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  try {
    let list = await List.findOne({ name: customListName });

    if (!list) {
      list = new List({ name: customListName, items: [] });
      await list.save();
    }

    res.render("list", { listTitle: list.name, newListItems: list.items });
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  try {
    if (listName === "Today") {
      await Item.findOneAndDelete({ _id: checkedItemId });
      res.redirect("/");
    } else {
      await List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedItemId } } }
      );
      res.redirect("/" + listName);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

