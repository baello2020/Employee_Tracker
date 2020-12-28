const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "ML1515Letmein!",
  database: "cms_db",
});
let rolesArr;
let departmentArr;
let employeeArr;
let employeeIdArr;
connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
});

function init() {
  rolesArr = [];
  departmentArr = [];
  employeeArr = [];
  employeeIdArr = [];
  connection.query("SELECT department FROM departments", function (err, res) {
    for (i = 0; i < res.length; i++) {
      departmentArr.push(res[i].department);
    }
    connection.query("SELECT title FROM roles", function (err, res) {
      for (i = 0; i < res.length; i++) {
        rolesArr.push(res[i].title);
      }
      connection.query(
        "SELECT employee_id, first_name, last_name FROM employees",
        function (err, res) {
          for (i = 0; i < res.length; i++) {
            employeeIdArr.push(res[i].employee_id);
            employeeArr.push(res[i].first_name + " " + res[i].last_name);
          }
          inquirer
            .prompt({
              name: "promptStart",
              type: "list",
              message: "What would you like to do?",
              choices: [
                "View All Employees",
                "View All Employees by Department",
                "View All Employees by Role",
                "Add Employee",
                "Add Role",
                "Add Department",
                "Remove Employee",
                "Remove Role",
                "Remove Department",
                // "Update Employee Name",
                // "Update Employee Role",
                // "Update Employee Department",
                "Exit",
              ],
            })
            .then(function (answers) {
              switch (answers.promptStart) {
                case "View All Employees":
                  connection.query(
                    "SELECT employees.employee_id, employees.first_name, employees.last_name, departments.department, roles.title, roles.salary FROM employees INNER JOIN departments ON employees.department_id=departments.department_id INNER JOIN roles ON employees.role_id=roles.role_id",
                    function (err, data) {
                      if (err) throw err;
                      console.table(data);
                      init();
                    }
                  );
                  break;
                case "View All Employees by Department":
                  byDeptOrRole("department", "departments", "Department");
                  break;
                case "View All Employees by Role":
                  byDeptOrRole("title", "roles", "Role");
                  break;
                case "Add Employee":
                  addItem("employees");
                  break;
                case "Add Role":
                  addItem("roles");
                  break;
                case "Add Department":
                  addItem("departments");
                  break;
                case "Remove Employee":
                  removeItem("employees");
                  break;
                case "Remove Role":
                  removeItem("roles");
                  break;
                case "Remove Department":
                  removeItem("department");
                  break;
                // case "Update Employee Name":
                //   break;
                // case "Update Employee Role":
                //   break;
                // case "Update Employee Department":
                //   break;
                case "Exit":
                  process.exit(1);
                  break;
              }
            })
            .catch((err) => {
              if (err) throw err;
            });
        }
      );
    });
  });
}

// function viewEmployees() {}

// Queries List
// connection.query(
//   "SELECT employees.employee_id, employees.first_name, employees.last_name, roles.title, roles.salary FROM employees INNER JOIN roles ON employees.roles.id=roles.roles.id",
//   function (err, data) {
//     if (err) throw err;
//     console.table(data);
//   }
// );

// Initiation Function
init();

function byDeptOrRole(col, table, deptOrRole) {
  connection.query("SELECT ?? FROM ??", [col, table], function (err, data) {
    if (err) throw err;
    choicesArr = [];
    if (col === "department") {
      for (i = 0; i < data.length; i++) {
        choicesArr.push(data[i].department);
      }
    } else {
      for (i = 0; i < data.length; i++) {
        choicesArr.push(data[i].title);
      }
    }
    inquirer
      .prompt({
        name: "deptRoleSelection",
        message: "Which " + deptOrRole + " would you like to see?",
        type: "list",
        choices: choicesArr,
      })
      .then((answers) => {
        connection.query(
          "SELECT employees.employee_id, employees.first_name, employees.last_name, departments.department, roles.title, roles.salary FROM employees INNER JOIN departments ON employees.department_id=departments.department_id INNER JOIN roles ON employees.role_id=roles.role_id WHERE ??.?? = ?",
          [table, col, answers.deptRoleSelection],
          function (err, data) {
            if (err) throw err;
            console.table(data);
            init();
          }
        );
        // answers.deptRoleSelection
      });
  });
}

function addItem(selection) {
  switch (selection) {
    case "employees":
      inquirer
        .prompt([
          {
            type: "input",
            name: "first_name",
            message: "Please input the Employee's First Name",
          },
          {
            type: "input",
            name: "last_name",
            message: "Please input the Employee's Last Name",
          },
          {
            type: "list",
            name: "title",
            message: "Please input the Employee's Title",
            choices: rolesArr,
          },
          {
            type: "list",
            name: "department",
            message: "Please input the Employee's Department",
            choices: departmentArr,
          },
        ])
        .then(function (answers) {
          //   console.log(answers);
          connection.query(
            "SELECT role_id FROM roles WHERE title='" + answers.title + "'",
            function (err, data) {
              if (err) throw err;
              roleCount = parseInt(data[0].role_id);
              //   console.log(roleCount + " Role Count")
              connection.query(
                "SELECT department_id FROM departments WHERE department='" +
                  answers.department +
                  "'",
                function (err, data) {
                  if (err) throw err;
                  //   console.log(data)
                  deptCount = parseInt(data[0].department_id);
                  //   console.log(deptCount + " Dept Count")
                  connection.query(
                    "INSERT INTO employees(first_name, last_name, role_id, department_id) VALUES (?,?,?,?)",
                    [
                      answers.first_name,
                      answers.last_name,
                      roleCount,
                      deptCount,
                    ],
                    function (err, data) {
                      if (err) throw err;
                      console.log("Employee Added!");
                      init();
                    }
                  );
                }
              );
            }
          );
        });
      break;
    case "roles":
      inquirer
        .prompt([
          {
            type: "input",
            name: "title",
            message: "Please input the name of the Role",
          },
          {
            type: "number",
            name: "salary",
            message: "Please input the Salary related to this position",
          },
          {
            type: "list",
            name: "department",
            message: "What department will this role be under?",
            choices: departmentArr,
          },
        ])
        .then(function (answers) {
          let deptCount;
          connection.query(
            "SELECT department_id FROM departments WHERE department='" +
              answers.department +
              "'",
            function (err, data) {
              if (err) throw err;
              //   console.log(data)
              deptCount = parseInt(data[0].department_id);
              connection.query(
                "INSERT INTO roles(title, salary, department_id) VALUES (?,?,?)",
                [answers.title, answers.salary, deptCount],
                function (err, data) {
                  if (err) throw err;
                  console.log("Role Added!");
                  init();
                }
              );
            }
          );
        });
      break;
    case "departments":
      inquirer
        .prompt([
          {
            type: "input",
            name: "department",
            message: "Please input the name of the Department",
          },
        ])
        .then(function (answers) {
          connection.query(
            "INSERT INTO departments (department) VALUES (?)",
            [answers.department],
            function (err, res) {
              if (err) throw err;
              console.log("Department Added!");
              init();
            }
          );
        });
      break;
  }
}

function removeItem(selection) {
  switch (selection) {
    case "employees":
      inquirer
        .prompt([
          {
            type: "list",
            name: "employee",
            message: "What employee would you like to remove?",
            choices: employeeArr,
          },
        ])
        .then((answers) => {
          let employeeIndex = employeeArr.indexOf(answers.employee);
          employeeId = employeeIdArr[employeeIndex];
          // console.log(employeeId)
          connection.query(
            "DELETE FROM employees WHERE employee_id=?",[employeeId],
            function (err, data) {
              if (err) throw err;
              console.log("Employee Deleted");
            }
          );
          init()
        });
      break;
    case "roles":
      inquirer
        .prompt([
          {
            type: "list",
            name: "title",
            message: "What role would you like to remove?",
            choices: rolesArr,
          },
        ])
        .then(function (answers) {
          connection.query(
            "DELETE FROM roles WHERE title=?",
            [answers.title],
            (err, res) => {
              if (err) throw err;
              console.log("Role has been deleted");
              init()
            }
          );
        });
      break;
    case "department":
      inquirer
        .prompt([
          {
            type: "list",
            name: "department",
            message: "Which department would you like to remove?",
            choices: departmentArr,
          },
        ])
        .then(function (answers) {
          connection.query(
            "SELECT department_id FROM departments WHERE department=?",
            [answers.department],
            (err, res) => {
              if (err) throw err;
              connection.query(
                "DELETE FROM departments WHERE department_id=?",
                [res.department_id],
                function (err, res) {
                  if (err) throw err;
                  console.log("Database Deleted!");
                  init()
                }
              );
            }
          );
        });
      break;
  }
}
