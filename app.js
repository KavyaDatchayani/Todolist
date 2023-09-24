const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ = require('lodash');
require("dotenv").config()




app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));


const myPassword = process.env.DB_PASSWORD


app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-kavya:" + myPassword + "@cluster0.3eenua6.mongodb.net/todolistDB");


// creating schema

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a task"]
  }
});

// creating mongoose model

const Item = mongoose.model("Item", itemSchema);

// creating new item 

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];


// creating new schema and making a connection 
const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) {


  //printing all store values in terminal (In my case Hyper Terminal)
  Item.find({})
    .then(foundItem => {
      if (foundItem.length === 0) {
        return Item.insertMany(defaultItems);
      } else {
        return foundItem;
      }
    })
    .then(savedItem => {
      res.render("list", {
        listTitle: "Today",
        newListItems: savedItem
      });
    })
    .catch(err => console.log(err));

});

// creating different post pages

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  })
    .then(function (foundList) {

      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        console.log("saved");
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    })
    .catch(function (err) { });
});

app.post("/", function (req, res) {


  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    })
      .then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
  }

});

app.post("/delete", function (req, res) {

  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;

  if (listName === "Today") {

    Item.findByIdAndRemove(checkedItemId).then(function (foundItem) {
      Item.deleteOne({
        _id: checkedItemId
      })
    })

    res.redirect("/");

  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }).then(function (foundList) {
      res.redirect("/" + listName);
    });
  }

});



app.get("/work", function (req, res) {
  res.render('list', {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.post("/work", function (req, res) {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about", function (req, res) {
  res.render("about");
})


app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
