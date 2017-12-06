"use strict";

// Dependencies
const inquirer = require("inquirer");
const mysql = require("mysql");
let result;
let resultsLength;
let item_quantity;
let customer_choice;
let choice_name;
let answers;
let response;

// Create mysql connection
const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "flowmar",
  password: "flowwithme1",
  database: "kablamazon"
});

// Object containing all questions
let questions = [
  {
    type: "input",
    name: "customer_choice",
    message: "\nPlease enter the ID number of the item you wish to purchase.",
    validate: function(value) {
      let pass;
      if (value > 0 && value <= 11) {
        pass = true;
        return pass;
      } else {
        return "ERROR: PLEASE ENTER A VALID NUMBER";
      }
    }
  },
  {
    type: "input",
    name: "item_quantity",
    message:
      "Please enter the quantity of the item that you would like to purchase.",
    validate: function(value) {
      if (value.match(/^[0-9]?[0-9]?$/)) {
        return true;
      } else {
        return "ERROR: PLEASE ENTER A VALID NUMBER.";
      }
    }
  }
];

// Log successful connenction to console
connection.connect(function(err) {
  if (err) throw err;
  console.log(
    "\nConnected! Welcome to Kablamazon, we are here to meet all of your electronic needs!\n"
  );
});

// Create a Promise that is resolved after the initial SQL query
let displayItems = new Promise(function(resolve, reject) {
  // Display a list of all items for sale, include: id, name and price.
  connection.query(
    "SELECT item_id, product_name, price FROM products",
    function(err, result, fields) {
      if (err) {
        throw err;
      } else {
        resultsLength = result.length;

        // Loop through the results array to pull the necessary data from each object
        for (let i = 0; i < result.length; i++) {
          console.log(
            "|| Item ID: " +
              result[i].item_id +
              " || " +
              "Product: " +
              result[i].product_name +
              " .…...........….......….... " +
              "Price: " +
              result[i].price
          );
        }
      }
    },
    err => {
      console.log(err);
    }
  );
  return result;
});

// Prompt User: Ask for ID# of item and then ask for quantitity
let first = new Promise((err, response) => {
  if (err) throw err;
  else {
    inquirer
      .prompt(questions)
      .then(answers => {
        customer_choice = answers.customer_choice;
        item_quantity = answers.item_quantity;
        console.log(
          "Item ID: " + customer_choice + "\nQuantity: " + item_quantity
        );
        return answers;
      })
      .then(answers => {
        console.log("choice: " + customer_choice);
        connection.query(
          `SELECT product_name FROM products WHERE item_id=?`,
          [customer_choice],
          (err, response, fields) => {
            if (err) {
              throw err;
            } else {
              choice_name = response[0].product_name;
              console.log(choice_name + "FIAUDEFIA");
            }
          }
        );
        return choice_name;
      });
  }
});

first.then(choice_name => {
  let confirmation = [
    {
      type: "confirm",
      name: "order_confirmation",
      message: [
        "You would like to purchase: " +
          item_quantity +
          " of the item " +
          choice_name
      ]
    }
  ];
  inquirer.prompt(confirmation).then(confirm => {
    if (confirm) {
      console.log(confirm);
      return true;
    } else {
      return "ERROR";
    }
  });
  return true;
});

/** After order is placed, check order vs stock

If current stock isn't sufficient, raise an error and do not complete the transaction
*/
