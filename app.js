const mysql = require('mysql');
const inquirer = require('inquirer');
const { database_password } = require('./config');
const util = require('util');
const con = mysql.createConnection({
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': database_password,
    'database': 'companyDB'
});
const queryPromise = util.promisify(con.query).bind(con);
con.connect(); // Connect to database

const defaultQuestions = [{
    'type': 'rawlist',
    'message': 'What action do you want to take?',
    'name': 'userChoice',
    choices: ['View Departments', 'View Roles', 'View Employees','View Employee By Manager', 'View Department Budget','Add Departments', 'Add Roles', 'Add Employees', 'Delete Department','Delete Role', 'Delete Employee', 'Update Employee Role', 'Update Manager Of Employee', 'Exit System']
}];

startSystem(); // Begin the app

async function startSystem(){
    const userAnswer = await inquirer.prompt(defaultQuestions);
    switch(userAnswer.userChoice){
        case 'View Departments':
            viewDepartments();
            break;
        case 'View Roles':
            viewRoles();
            break;
        case 'View Employees':
            viewEmployees();
            break;
        case 'View Employee By Manager': // Not done
            viewEmployeeByManager();
            break;
        case 'View Department Budget': // Not done
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
        case 'Update Manager Of Employee': // Not Done
            updateManagerOfEmployee();
            break;
        case 'Exit System':
            con.end()
            break;
            
        //Advanced
    }
}
//Need to make it beautiful
async function viewDepartments(){
    try{
        console.log('Viewing Dep');
        const departments = await queryPromise('SELECT * FROM companyDB.department');
        console.log(departments);
        startSystem();
    }catch(e){
        throw e;
    }
  
}

//Need to make it beautiful
async function viewRoles(){
    console.log('Viewing Roles')
    try{
        const roles = await queryPromise('SELECT * FROM companyDB.role')
        console.log(roles);
        startSystem()
    }catch(e){
        throw e
    }
  
}

//Need to make it beautiful
async function viewEmployees(){
    console.log('Viewing Employees');
    try{
        const employees = await queryPromise('SELECT * FROM companyDB.employee')
        console.log(employees);
        startSystem()
    }catch(e){
        throw e
    }
}

//Done
async function addDepartments(){
    //INSERT INTO department(id,name)
    try{
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
    }catch(e){
        throw e;
    }
}

//Done
async function addRoles(){
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

    try{
        const answer = await inquirer.prompt(questions);
        await queryPromise(`INSERT INTO role(id,title,salary,department_id) VALUES(${answer.roleID}, "${answer.roleTitle}", ${answer.roleSalary}, ${answer.depID})`);
        console.log(`Added role: "${answer.roleTitle}" successfully!`);
        startSystem();
    }catch(e){
        throw e
    }
}

//Done
async function addEmployees(){
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
    },{
        'type': 'number',
        'message': "What is the ID of this employee's manager?",
        'name': 'managerID'
    }]
    try{
        const answer = await inquirer.prompt(questions);
        const managerID = isNaN(answer.managerID) ? null : answer.managerID

        await queryPromise(`INSERT INTO employee(id,first_name,last_name,role_id,manager_id) VALUES(${answer.employeeID}, "${answer.employeeFirst}", "${answer.employeeLast}", ${answer.roleID}, ${managerID})`);
        console.log(`Added employee: "${answer.employeeFirst}" "${answer.employeeLast}" successfully!`);
        startSystem();
    }catch(e){
        throw e;
    }
}

// Done
async function deleteDepartment(){
    try{   
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
    }catch(e){
        throw e
    }
}

// Done
async function deleteRole(){
    try{   
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
    }catch(e){
        throw e
    }
}

// Done
async function deleteEmployee(){
    try{   
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
    }catch(e){
        throw e
    }
}

// Need refactor but 99% done
async function updateEmployeeRoles(){
    try{
        const sqlQuery = "SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee INNER JOIN role ON employee.role_id = role.id";
        const result = await queryPromise(sqlQuery);
        const employeeList = result.map(item => 'id: ' + item.id + ' - ' + item.first_name + " " + item.last_name)
        
        //This question is to determine which employee to change
        const firstQuestion = [{
            'type': 'rawlist',
            'message': 'Which employee do you want to update role for?',
            'name': 'chosenEmployee',
            'choices' : employeeList
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
            'choices' : roleList
        }]
        const answer2 = await inquirer.prompt(secondQuestion)
        const chosenRole = answer2.chosenRole;
        const newRoleID = chosenRole.substring(4, chosenRole.indexOf('-')).trim(); 

        const updateSQL = `UPDATE employee SET role_id = ${newRoleID} WHERE id = ${chosenEmployeeID}`
        await queryPromise(updateSQL);
        console.log('Successfully updated');
        startSystem();
    }catch(e){
        throw e
    }
}

// Need to be beautified
async function viewEmployeeByManager(){
    try{
        const query = `SELECT t1.id AS 'Employee ID', concat(t1.first_name, ' ', t1.last_name) AS 'Employee Name', t2.id AS 'Manager ID', 
        concat(t2.first_name, ' ', t2.last_name)  AS 'Manager Name'
        FROM employee t1, employee t2
        WHERE t1.manager_id = t2.id`;

        const queryResult = await queryPromise(query);
        console.log(queryResult)

    }catch(e){
        throw e
    }
}

// Need refactoring
async function updateManagerOfEmployee(){
    try{
        // SELECT * FROM employee
        const queryResult = await queryPromise('SELECT * FROM employee');
        const list = queryResult.map(item => {
            return 'id: ' + item.id + ' - ' + item.first_name + " " + item.last_name
        })

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

        if(chosenManagerID == chosenEmployeeID){
            chosenManagerID = null
        }
        await queryPromise(`UPDATE employee SET manager_id = ${chosenManagerID} WHERE id = ${chosenEmployeeID}`)
        console.log('Update Manager Successfully')

    }catch(e){
        throw e
    }
}
                // Advance (NOT DONE) //

//Need to be done
async function viewDepartmentBudget(){
    try{
        //the combined salaries of all employees in that department
        // Join department and role and employee
    } catch(e){
        throw e
    }
}


