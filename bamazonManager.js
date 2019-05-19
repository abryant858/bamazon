var mysql = require("mysql");
var inquirer = require("inquirer");
//Method to display data in nice columns
const cTable = require('console.table')

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
  //start();
});
//Displays Menu
function start() {
    inquirer
      .prompt({
        name: "options",
        type: "list",
        message: "What would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        })
        .then(function(resp) {
            if (resp.options === "View Products for Sale") {
                queryInventory()
            }
            if (resp.options === "View Low Inventory") {
                queryLowInventory()
            }
            if (resp.options === "Add to Inventory") {
                addInventory()
            }
            if (resp.options === "Add New Product") {
                newProduct()
            }
        })
}
//Function to display data table
function queryInventory() {
    connection.query("SELECT * FROM products", function(err, res) {
      //console.log("item_id product_name    price");
      //console.log("------- --------------------------------- ------");
      //for (var i = 0; i < res.length; i++) {
        //console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].price + " | " + res[i].stock_quantity);
     // }
     console.table(res)
      console.log("-----------------------------------");
      start()
    });
}
//Function to display low inventoy
function queryLowInventory() {
    connection.query("SELECT * FROM products", function(err, res) {
      console.log("item_id product_name    price");
      //console.log("------- --------------------------------- ------");
      for (var i = 0; i < res.length ; i++) {
          if (res[i].stock_quantity < 5) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].price + " | " + res[i].stock_quantity);
          }
      }
      console.log("-----------------------------------");
      start()
    });
}

function addInventory() {
    inquirer
      .prompt([
        {
        name: "item_id",
        type: "input",
        message: "What's the ID of the product that inventory will be added?"
        },
        {
        name: "quantity",
        type: "input",
        message: "How many units of the product would you like to add?"
        }
      ])
      .then(function(input) {
        var id = input.item_id;
        var quant = parseInt(input.quantity);
        connection.query("SELECT * FROM products WHERE ?",{ item_id: id}, function(err, res) {
          
          if (err) throw err;
          if (res.length === 0){
            console.log("Invalid...Please enter valid Product ID.")
            runSearch()
          }
           else {
            var item = res[0];
            //console.log(quant)
            connection.query("UPDATE products SET ? WHERE ?",
                [
                {
                    stock_quantity: (item.stock_quantity + quant)
                },
                {
                    item_id: id
                }
                ],
            )
            console.log("Successfully added " + quant + " " + item.product_name + "!");
            
            queryInventory()
            start();
              
           } 
        });
      })
  }

function newProduct() {
    inquirer
    .prompt([
      {
        name: "prod_name",
        type: "input",
        message: "What is the product you would like to submit?"
      },
      {
        name: "dept_name",
        type: "input",
        message: "What category would you like to place your product in?"
      },
      {
        name: "cost",
        type: "input",
        message: "What would you like the price to be?"
      },
      {
        name: "stock_quant",
        type: "input",
        message: "How many units are available?",
      }
    ])
    .then(function(resp) {
        // when finished prompting, insert a new item into the db with that info
        connection.query(
          "INSERT INTO products SET ?",
          {
            product_name: resp.prod_name,
            department_name: resp.dept_name,
            price: resp.cost,
            stock_quantity: resp.stock_quant
          },
          function(err) {
            if (err) throw err;
            console.log("Your product was submitted successfully!");
            // re-prompt the user for if they want to bid or post
            start();
          }
        );
      });
}
function welcomeBamazon() {
    console.log("*****WELCOME TO BAMAZON MANAGER PORTAL*****");
    start();
}
//Start application with displaying menu options.
welcomeBamazon();