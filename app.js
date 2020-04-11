const mysql = require('mysql');
const inquirer = require('inquirer');
const util = require('util');
const dotenv = require('dotenv');
const cTable = require('console.table');

dotenv.config();

const con = mysql.createConnection({
    'host': process.env.HOST,
    'port': process.env.PORT,
    'user': process.env.USERNAME,
    'password': process.env.PASSWORD,
    'database': process.env.DATABASE
});

const queryPromise = util.promisify(con.query).bind(con);
con.connect(); // Connect to database

const defaultQuestions = [{
    'type': 'rawlist',
    'message': 'What action do you want to take?',
    'name': 'userChoice',
    choices: ['View Departments', 'View Roles', 'View Employees', 'View Employee By Manager', 'View Department Budget', 'Add Departments', 'Add Roles', 'Add Employees', 'Delete Department', 'Delete Role', 'Delete Employee', 'Update Employee Role', 'Update Manager Of Employee', 'Exit System']
}];

startSystem(); // Begin the app

async function startSystem() {
    const userAnswer = await inquirer.prompt(defaultQuestions);
    switch (userAnswer.userChoice) {
        case 'View Departments':
            viewDepartments();
            break;
        case 'View Roles':
            viewRoles();
            break;
        case 'View Employees':
            viewEmployees();
            break;
        case 'View Employee By Manager':
            viewEmployeeByManager();
            break;
        case 'View Department Budget':
            viewDepartmentBudget()
            break;
        case 'Add Departments':
            addDepartments();
            break;
        case 'Add Roles':
            addRoles();
            break;
        case 'Add Employees':
            addEmployees();
            break;
        case 'Delete Department':
            deleteDepartment();
            break;
        case 'Delete Role':
            deleteRole();
            break;
        case 'Delete Employee':
            deleteEmployee();
            break;
        case 'Update Employee Role':
            updateEmployeeRoles();
            break;
        case 'Update Manager Of Employee':
            updateManagerOfEmployee();
            break;
        case 'Exit System':
            con.end()
            break;
    }
}
//Done
async function viewDepartments() {
    try {
        console.log('\nList of Department \n');
        console.log(`---------------------------------------------`)
        const departments = await queryPromise('SELECT * FROM companyDB.department');
        let result = departments.map(item => [item.id, item.name])
        console.table(['Department ID', 'Department Name'], result)
        console.log(`---------------------------------------------`)
        startSystem();
    } catch (e) {
        throw e;
    }
}

//Done
async function viewRoles() {
    console.log('Viewing Roles')
    try {
        console.log('\nList of Roles \n');
        console.log(`-------------------------------------------------------------`)
        const roles = await queryPromise('SELECT * FROM companyDB.role')
        let result = roles.map(item => [item.id, item.title, item.salary, item.department_id])
        console.table(['Role ID', 'Role Title', 'Role Salary', 'Department ID'], result)
        console.log(`-------------------------------------------------------------`)
        startSystem()
    } catch (e) {
        throw e
    }

}

// Done
async function viewEmployees() {
    console.log('Viewing Employees');
    try {
        console.log('\nList of Employees \n');
        console.log(`-------------------------------------------------------------`);
        const employees = await queryPromise('SELECT * FROM companyDB.employee');
        let result = employees.map(item => [item.id, item.first_name, item.last_name, item.role_id, item.manager_id])
        console.table(['Employee ID', 'First Name', 'Last Name', 'Role ID', 'Manager ID'], result)
        console.log(`-------------------------------------------------------------`);
        startSystem()
    } catch (e) {
        throw e
    }
}

// Done
async function viewEmployeeByManager() {
    try {
        const query = `SELECT t1.id AS 'Employee ID', concat(t1.first_name, ' ', t1.last_name) AS 'Employee Name', t2.id AS 'Manager ID', 
        concat(t2.first_name, ' ', t2.last_name)  AS 'Manager Name'
        FROM employee t1, employee t2
        WHERE t1.manager_id = t2.id`;

        console.log('\nList of Employee by Manager \n');
        console.log(`---------------------------------------------`);
        const queryResult = await queryPromise(query);
        let result = queryResult.map(item => [item['Employee ID'], item['Employee Name'], item['Manager ID'], item['Manager Name']])
        console.table(['Employee ID', 'Employee Name', 'Manager ID', 'Manager Name'], result);
        console.log(`---------------------------------------------`);
        startSystem();

    } catch (e) {
        throw e
    }
}

// Done
async function viewDepartmentBudget() {
    try {
        const query = `SELECT d.name AS 'Department', SUM(r.salary) AS 'Total Budget'
        FROM employee AS e
        INNER JOIN role AS r
        ON e.role_id = r.id
        INNER JOIN department AS d
        ON r.department_id = d.id
        GROUP BY d.name
        `

        console.log('\nTotal Budget By Department \n');
        console.log(`---------------------------------------------`);
        const queryResult = await queryPromise(query);
        let result = queryResult.map(item => [item['Department'], item['Total Budget']])
        console.table(['Department', 'Total Budget'], result);
        console.log(`---------------------------------------------`);
        startSystem()

    } catch (e) {
        throw e
    }
}

//Done
async function addDepartments() {
    //INSERT INTO department(id,name)
    try {
        console.log('Inserting Dep');

        const questions = [{
            'type': 'number',
            'message': 'What is the department ID you want to add?',
            'name': 'depID'
        }, {
            'type': 'input',
            'message': 'What is the name of this department?',
            'name': 'depName'
        }]
        const answer = await inquirer.prompt(questions);

        await queryPromise(`INSERT INTO department(id,name) VALUES(${answer.depID}, "${answer.depName}")`);

        console.log(`Added department: "${answer.depName}" successfully!`);
        startSystem();
    } catch (e) {
        throw e;
    }
}

//Done
async function addRoles() {
    const questions = [{
        'type': 'number',
        'message': 'What is the role ID you want to add?',
        'name': 'roleID'
    }, {
        'type': 'input',
        'message': 'What is the title of this role?',
        'name': 'roleTitle'
    }, {
        'type': 'number',
        'message': 'What is the salary for this position? (Up to 6 digits with "." as decimal seperator)',
        'name': 'roleSalary'
    }, {
        'type': 'number',
        'message': 'What is the department ID of this role?',
        'name': 'depID'
    }]

    try {
        const answer = await inquirer.prompt(questions);
        await queryPromise(`INSERT INTO role(id,title,salary,department_id) VALUES(${answer.roleID}, "${answer.roleTitle}", ${answer.roleSalary}, ${answer.depID})`);
        console.log(`Added role: "${answer.roleTitle}" successfully!`);
        startSystem();
    } catch (e) {
        throw e
    }
}

//Done
async function addEmployees() {
    const questions = [{
        'type': 'number',
        'message': 'What is this employee ID?',
        'name': 'employeeID'
    }, {
        'type': 'input',
        'message': 'What is his/her first name?',
        'name': 'employeeFirst'
    }, {
        'type': 'input',
        'message': 'What is his/her last name',
        'name': 'employeeLast'
    }, {
        'type': 'number',
        'message': 'What is the role ID of this employee?',
        'name': 'roleID'
    }, {
        'type': 'number',
        'message': "What is the ID of this employee's manager?",
        'name': 'managerID'
    }]
    try {
        const answer = await inquirer.prompt(questions);
        const managerID = isNaN(answer.managerID) ? null : answer.managerID

        await queryPromise(`INSERT INTO employee(id,first_name,last_name,role_id,manager_id) VALUES(${answer.employeeID}, "${answer.employeeFirst}", "${answer.employeeLast}", ${answer.roleID}, ${managerID})`);
        console.log(`Added employee: "${answer.employeeFirst}" "${answer.employeeLast}" successfully!`);
        startSystem();
    } catch (e) {
        throw e;
    }
}

// Done
async function deleteDepartment() {
    try {
        const result = await queryPromise('SELECT * FROM department')
        const list = result.map(item => item.name)
        const question = [{
            'type': 'rawlist',
            'message': 'Which department you want to delete?',
            'name': 'tobeDeleted',
            'choices': list
        }]

        const answer = await inquirer.prompt(question);
        const chosenDepartment = answer.tobeDeleted;

        await queryPromise(`DELETE FROM department WHERE name = "${chosenDepartment}"`)

        console.log(`Successfully deleted department : ${chosenDepartment}`)
        startSystem()
    } catch (e) {
        throw e
    }
}

// Done
async function deleteRole() {
    try {
        const result = await queryPromise('SELECT * FROM role')
        const list = result.map(item => item.title)
        const question = [{
            'type': 'rawlist',
            'message': 'Which role do you want to delete?',
            'name': 'tobeDeleted',
            'choices': list
        }]

        const answer = await inquirer.prompt(question);
        const chosenRole = answer.tobeDeleted;

        await queryPromise(`DELETE FROM role WHERE title = "${chosenRole}"`)

        console.log(`Successfully deleted role : ${chosenRole}`)
        startSystem()
    } catch (e) {
        throw e
    }
}

// Done
async function deleteEmployee() {
    try {
        const result = await queryPromise('SELECT * FROM employee')

        const list = result.map(item => {
            return 'id: ' + item.id + ' - ' + item.first_name + " " + item.last_name
        })
        console.log(list)
        const question = [{
            'type': 'rawlist',
            'message': 'Which department you want to delete?',
            'name': 'tobeDeleted',
            'choices': list
        }]

        const answer = await inquirer.prompt(question);
        const tobeDeleted = answer.tobeDeleted
        const chosenID = tobeDeleted.substring(4, tobeDeleted.indexOf('-')).trim();
        await queryPromise(`DELETE FROM employee WHERE id = "${chosenID}"`)

        console.log(`Successfully deleted employee with id: ${chosenID}`)
        startSystem()
    } catch (e) {
        throw e
    }
}

// Done
async function updateEmployeeRoles() {
    try {
        const sqlQuery = "SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee INNER JOIN role ON employee.role_id = role.id";
        const result = await queryPromise(sqlQuery);
        const employeeList = result.map(item => 'id: ' + item.id + ' - ' + item.first_name + " " + item.last_name)
        const updateQuery = await getQueryUpdatingEmployeeRole(employeeList)
        await queryPromise(updateQuery);
        console.log('\nSuccessfully updated\n');
        startSystem();
    } catch (e) {
        throw e
    }
}

// Done
async function updateManagerOfEmployee() {
    try {
        // SELECT * FROM employee
        const queryResult = await queryPromise('SELECT * FROM employee');
        const list = queryResult.map(item => {
            return 'id: ' + item.id + ' - ' + item.first_name + " " + item.last_name
        })

        const updateQuery = await getQueryUpdateManager(list);
        // console.log(updateQuery)
        await queryPromise(updateQuery);
        console.log('\nUpdate Manager Successfully\n');
        startSystem();
    } catch (e) {
        throw e
    }
}

//Helper
async function getQueryUpdatingEmployeeRole(employeeList){
    const firstQuestion = [{
        'type': 'rawlist',
        'message': 'Which employee do you want to update role for?',
        'name': 'chosenEmployee',
        'choices': employeeList
    }]

    const answer = await inquirer.prompt(firstQuestion) // This gets the chosen employee
    const chosenEmployee = answer.chosenEmployee
    const chosenEmployeeID = chosenEmployee.substring(4, chosenEmployee.indexOf('-')).trim();

    // Now we have the chosenID as ID already. Now
    // Query the list of all possible role
    const queryToRole = await queryPromise('SELECT id,title FROM role');
    const roleList = queryToRole.map(item => 'id: ' + item.id + ' - ' + item.title)

    const secondQuestion = [{
        'type': 'rawlist',
        'message': 'Select the new role you want to update to',
        'name': 'chosenRole',
        'choices': roleList
    }]

    const answer2 = await inquirer.prompt(secondQuestion)
    const chosenRole = answer2.chosenRole;
    const newRoleID = chosenRole.substring(4, chosenRole.indexOf('-')).trim();

    const updateSQL = `UPDATE employee SET role_id = ${newRoleID} WHERE id = ${chosenEmployeeID}`;

    return updateSQL;
}

async function getQueryUpdateManager(list){
    const firstQuestion = [{
        'type': 'rawlist',
        'message': 'Which employee are you changing manager for?',
        'name': 'chosenEmployee',
        'choices': list
    }]

    // This is to find the ID of which employee want to update manager for
    const answer = await inquirer.prompt(firstQuestion);
    const chosenEmployee = answer.chosenEmployee;
    const chosenEmployeeID = chosenEmployee.substring(4, chosenEmployee.indexOf('-')).trim();

    // This is to determine ID of the manager
    // If the same, set it to null
    const secondQuestion = [{
        'type': 'rawlist',
        'message': 'Who is the new manager? Choosing the same person means the employee has no new manager',
        'name': 'chosenManager',
        'choices': list
    }]

    const answer2 = await inquirer.prompt(secondQuestion);
    const chosenManager = answer2.chosenManager;
    let chosenManagerID = chosenManager.substring(4, chosenManager.indexOf('-')).trim();

    if (chosenManagerID == chosenEmployeeID) {
        chosenManagerID = null
    }

    return `UPDATE employee SET manager_id = ${chosenManagerID} WHERE id = ${chosenEmployeeID}`
}
