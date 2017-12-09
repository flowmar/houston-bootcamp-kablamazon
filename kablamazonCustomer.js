// Dependencies
const inquirer = require("inquirer");
const mysql = require("mysql");
const chalk = require("chalk");

// Global Object to hold current answers
let tAnswer = {};

// Global variables
const log = console.log;
let item_quantity;
let choice_name;
let current_choice;
let requested_quantity;
let confirmation = [];
let confirmed;
let current_item_stock_quantity;

// MySQL connection configuration
const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "flowmar",
  password: "flowwithme1",
  database: "kablamazon"
});

// Log successful connenction to console
connection.connect(function(err) {
  if (err) throw err;
  console.log(
    chalk.blue(
      "\nConnected! Welcome to Kablamazon, we are here to meet all of your electronic needs!\n"
    )
  );
});

// Object containing questions
let questions = [
  {
    type: "input",
    name: "customer_choice",
    message:
      "\nPlease enter the ID number of the item that you wish to purchase",

    // Ensure that the value is between 1 and 11
    validate: function(value) {
      let pass;
      if (value > 0 && value <= 11) {
        pass = true;
        return pass;
      } else {
        return "ERROR: Please enter a valid number.";
      }
    }
  },
  {
    type: "input",
    name: "item_quantity",
    message: "Please enter the quantity of the item that you wish to purchase.",
    validate: function(value) {
      // Regex -- Matches at the beginning of the line, a number 0-9 zero or more times followed by another digit from the same range zero or more times and the second number must be the end of the line
      if (value.match(/^[0-9]?[0-9]?$/)) {
        return true;
      } else {
        return "ERROR: Please enter a valid quantity.";
      }
    }
  }
];

// Function that displays the data currently in the database
async function displayItems() {
  await connection.query(
    "SELECT item_id, product_name, price FROM products",
    function(err, result, fields) {
      if (err) throw err;
      else {
        let resultsLength = result.length;

        // Loop through the results array to pull the necessary data from each object
        for (let i = 0; i < result.length; i++) {
          console.log(
            chalk.grey("|| ") +
              chalk.magenta("Item ID: ") +
              chalk.bold(result[i].item_id) +
              chalk.grey(" || ") +
              chalk.bold.keyword("orange")("Product: ") +
              chalk.bold(result[i].product_name) +
              " .…...........….......….... " +
              chalk.whiteBright("Price: ") +
              chalk.bold.greenBright(result[i].price)
          );
        }
      }
    }
  );
}

// Ask for item id number
async function first() {
  await inquirer.prompt(questions[0]).then(answers => {
    console.log(answers);
    // Places the customer_choice into the global object
    tAnswer.current_choice = answers.customer_choice;
    console.log(tAnswer.current_choice);
    return true;
  });
}

// Ask for item quantity
async function second() {
  await inquirer.prompt(questions[1]).then(answers => {
    // Places the requested_quantity in to the global object
    tAnswer.requested_quantity = answers.item_quantity;
    console.log(tAnswer.requested_quantity);
    return true;
  });
}

// Check the ID number entered by the customer against the product database and locate the name of the product
async function checkId() {
  current_choice = tAnswer.current_choice;
  await connection.query(
    `SELECT product_name FROM products WHERE item_id=?`,
    [current_choice],
    await function(err, response, fields) {
      if (err) {
        throw err;
      } else {
        tAnswer.choice_name = response[0].product_name;
        console.log("Loading...");
        setTimeout(() => {
          console.log("Finished!");
        }, 2000);
        return tAnswer.choice_name;
      }
    }
  );
}

// Pulls variables from the tAnswer object and sets up variables and the order_confirmation question
async function setUp() {
  choice_name = tAnswer.choice_name;
  current_choice = tAnswer.current_choice;
  requested_quantity = tAnswer.requested_quantity;
  confirmation = [
    {
      type: "confirm",
      name: "order_confirmation",
      message: [
        "You would like to purchase: " +
          tAnswer.requested_quantity +
          " of the item " +
          tAnswer.choice_name +
          ". Is this correct?"
      ]
    }
  ];
}

// Retrieves the current stock of the selected item
async function stockCheck(current_choice) {
  await connection.query(
    "SELECT stock_quantity FROM products WHERE item_id=?",
    [current_choice],
    await function(err, response, fields) {
      if (err) {
        console.error(err);
      } else {
        current_item_stock_quantity = response[0].stock_quantity;
        console.log(
          chalk.bold.green(
            "Current item stock: " + current_item_stock_quantity
          ) +
            "    " +
            chalk.bold.cyan("Number requested: " + requested_quantity)
        );
      }
    }
  );
}

// Confirm that the order is correct
async function confirm() {
  await inquirer
    .prompt(confirmation)
    .then(answer => {
      console.log(answer);
      answerValue = answer.order_confirmation;
      console.log(answerValue);
      if (answerValue === true) {
        stockCheck(tAnswer.current_choice);
        console.log(
          chalk.bold.keyword("orange")("Item ID: " + tAnswer.current_choice)
        );
        confirmed = true;
        console.log(confirmed + "CONFIRMEDDDAA");
        return true;
      } else if ((answerValue = false)) {
        confirmed = false;
        log(confirmed + "AFVJADSOFGJDAS");
        return false;
      }
    })
    .catch(err => console.error(err));
  console.log(confirmed);
  return confirmed;
}

function restart() {
  start();
}
// Start function to begin the program
function start() {
  // Display items
  displayItems()
    // Ask Questions
    .then(_ => first())
    .then(_ => second())
    // Check which product is chosen via ID number
    .then(_ => checkId())
    .then(_ =>
      setTimeout(() => {
        setUp();
      }, 3000)
    )
    // Confirm that the order is correct
    .then(() => {
      setTimeout(function() {
        confirm()
          .then(confirmed => {
            console.log("this is the answer" + confirmed);
            if (confirmed === true) {
              // Compare the stock and requested quantities
              setTimeout(async function compare() {
                if (current_item_stock_quantity >= requested_quantity) {
                  let difference =
                    current_item_stock_quantity - requested_quantity;
                  // Subtract requested_quantity from stock_quantity in a sql query
                  await connection.query(
                    "UPDATE products SET stock_quantity = ? WHERE item_id = ?",
                    [difference, current_choice],
                    await function(err, response, fields) {
                      if (err) {
                        throw err;
                      } else {
                        log(
                          chalk.bold.greenBright(
                            "Transaction completed! Congratulations on your new items!"
                          )
                        );
                        restart();
                      }
                    }
                  );
                } else {
                  console.log(
                    chalk.bold.red(
                      "Not enough stock. \n !~TRANSACTION CANCELLED~! \n \n There was not enough stock to fulfill your order, so your transaction was cancelled. Please start over and try again. Thank you for shopping with Kablamazon.\n \n "
                    )
                  );
                  restart();
                }
              }, 2000);
            } else if (confirmed === false) {
              console.log("confirmed was false");
              restart();
            }
          })
          .catch(err => console.error(err));
        // .then(_ => {
        //   if (0 === 0) {
        //     Promise.resolve("Yahoo!");
        //     return true;
        //   } else {
        //     Promise.reject(new Error("byeee"));
        //     return false;
        //   }
        // });
      }, 4000);
    });
}
start();
