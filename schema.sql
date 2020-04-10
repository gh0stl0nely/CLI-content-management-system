DROP DATABASE IF EXISTS companyDB;

CREATE DATABASE companyDB;

USE companyDB;

CREATE TABLE department(
    id int,
    name varchar(30),
    PRIMARY KEY (id)
);

CREATE TABLE role (
    id int,
    title varchar(30),
    salary decimal(6,3),
    department_id int,
    PRIMARY KEY (id)
);

CREATE TABLE employee(
    id int,
    first_name varchar(30),
    last_name varchar(30),
    role_id int,
    manager_id int DEFAULT NULL, 
    PRIMARY KEY (id)
);

INSERT INTO department(id,name) VALUES (1,'SOFTWARE')
INSERT INTO role(id,title,salary,department_id) VALUES (1,'Software engineer', 100.000, 1)
INSERT INTO employee(id,first_name,last_name,role_id) VALUES (1,'Andy', 'Lau', 1)