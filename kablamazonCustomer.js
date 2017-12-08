// Dependencies
const inquirer = require("inquirer");
const mysql = require("mysql");

// Global Object to hold current answers
let tAnswer = {};

// Global variables
let item_quantity;
let choice_name;
let current_choice;
let current_quantity;
let confirmation = [];

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
    "\nConnected! Welcome to Kablamazon, we are here to meet all of your electronic needs!\n"
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
    // Places the current_quantity in to the global object
    tAnswer.current_quantity = answers.item_quantity;
    console.log(tAnswer.current_quantity);
    return true;
  });
}

// Confirm that the order is correct
async function confirm() {
  inquirer
    .prompt(confirmation)
    .then(answer => {
      if (answer) {
        stockCheck(tAnswer.current_choice);
        console.log(tAnswer.current_choice);
      }
      return true;
    })
    .catch(err => console.error(err));
  return true;
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
          console.log("Query result!");
        }, 2000);
        return tAnswer.choice_name;
      }
    }
  );
}

async function printOut() {
  choice_name = tAnswer.choice_name;
  current_choice = tAnswer.current_choice;
  current_quantity = tAnswer.current_quantity;
  confirmation = [
    {
      type: "confirm",
      name: "order_confirmation",
      message: [
        "You would like to purchase: " +
          tAnswer.current_quantity +
          " of the item " +
          tAnswer.choice_name +
          ". Is this correct?"
      ]
    }
  ];
  // console.log(
  //   "Quantity: " +
  //     tAnswer.current_quantity +
  //     "\nItem Name: " +
  //     tAnswer.choice_name
  // );
  // console.log(JSON.stringify(tAnswer));
  // return true;
}

async function stockCheck(current_choice) {
  connection.query(
    "SELECT stock_quantity FROM products WHERE item_id=?",
    [current_choice],
    await function(err, response, fields) {
      if (err) {
        console.error(err);
      } else {
        console.log(response);
      }
    }
  );
}

displayItems()
  .then(_ => first())
  .then(_ => second())
  .then(_ => checkId())
  .then(_ =>
    setTimeout(() => {
      printOut();
      confirm();
    }, 3000)
  )
  .then(_ => confirm())
  .catch(err => console.error(err))
  .then(_ => {
    if (0 === 0) {
      Promise.resolve("Yahoo!");
      return true;
    } else {
      Promise.reject(new Error("byeee"));
      return false;
    }
  });
