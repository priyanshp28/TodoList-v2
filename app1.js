const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://priyansh28:Priyansh28@cluster0.cy8r8rs.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todo list"
});
const item2 = new Item({
    name: "Click on + to add more items to your todo list"
});
const item3 = new Item({
    name: "Click <-- to remove item from your todo list"
});

const defaultItems = [item1, item2, item3];

const listSchema={
    name: String,
    items: [itemSchema]
};

const List= mongoose.model("List", listSchema);

app.get("/", function (req, res) {
    
    Item.find({})
    .then(function (founditems) {
        if (founditems.length === 0) {

            Item.insertMany(defaultItems)
            .then(function () {
                    console.log("Successfully save default items to database");
                })
                .catch(function (err) {
                        console.log(err);
                    }
                    )
                    res.redirect("/");
                }
                else {
                    res.render("list", { ListTitle: "Today", newListItems: founditems });

            }
        })
        .catch(function (err) {
            console.log(err);
        }
        )

});

app.get("/:customListName", function(req, res) {
    const customListName= _.capitalize(req.params.customListName);

    List.findOne({name:customListName})
   .then(function(foundlist)
   {
       if(!foundlist)
       {
        const list= new List({
            name: customListName,
            items: defaultItems
        })
        list.save();
        
        res.redirect("/"+ customListName);
    }
    else
    {
        res.render("list", { ListTitle: foundlist.name, newListItems: foundlist.items });
    }
})
.catch(function(err)
{
    console.log(err);
})

});


app.post("/", function (req, res) {

    let itemName = req.body.newItem;
    const listName= req.body.list;

    const item= new Item({
        name: itemName
    });
    
    if(listName==="Today")
    {
        item.save();
        res.redirect("/");
    }
    else
    {
        List.findOne({name: listName})
        .then(function(foundlist)
        {
            foundlist.items.push(item);
            foundlist.save();
            res.redirect("/"+ listName);
        })
        .catch(function(err)
        {
            console.log(err);
        }
        )
    }
    
});

app.post("/delete",function(req, res)
{
    const checkeditem_id= req.body.checkBox;
    const listName= req.body.listName;

    if(listName==="Today")
    {
        Item.findByIdAndRemove(checkeditem_id)
        .then(function()
            {
               console.log("Checked item successfully deleted");
               res.redirect("/");
            }
        )
        .catch(function(err)
        {
            console.log(err);
        })
    }
    else
    {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkeditem_id}}})
        .then(function(foundlist)
        {
            res.redirect("/"+listName);
        })
        .catch(function(err)
        {
            console.log(err);
        })
    }

})


app.listen(process.env.PORT || 3000, function () {
    console.log("server has started running succuessfully");
})

