var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 8889,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon_DB"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  queryInventory();
});

function queryInventory() {
  connection.query("SELECT * FROM products", function(err, res) {
    console.log("item_id product_name    price");
    //console.log("------- --------------------------------- ------");
    for (var i = 0; i < res.length; i++) {
      console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].price + " | " + res[i].stock_quantity);
    }
    console.log("-----------------------------------");
    runSearch()
  });
}

function runSearch() {
  inquirer
    .prompt([
      {
      name: "item_id",
      type: "input",
      message: "What's the ID of the product you would like to buy?"
      },
      {
      name: "quantity",
      type: "input",
      message: "How many units of the product would you like to buy?"
      }
    ])
    .then(function(input) {
      var id = input.item_id;
      var quant = input.quantity;
      connection.query("SELECT * FROM products WHERE ?",{ item_id: id}, function(err, res) {
        
        if (err) throw err;
        if (res.length === 0){
          console.log("Invalid...Please enter valid Product ID.")
          runSearch()
        }
         else {
          var item = res[0];
          //console.log(quant)
            if (quant <= item.stock_quantity) {
              console.log("Congrats, there is sufficient inventory.")
              connection.query("UPDATE products SET ? WHERE ?",
                [
                  {
                    stock_quantity: item.stock_quantity - quant
                  },
                  {
                    item_id: id
                  }
                ],
              )
              console.log("Successfully purcahsed " + quant + " " + item.product_name + "!");
              console.log("Your total cost is $" + item.price);
              queryInventory()
            }
            else {
              console.log("Insufficient quantity!");
              runSearch();
            }
         } 
      });
    })
}