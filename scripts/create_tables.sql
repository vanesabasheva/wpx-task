CREATE DATABASE IF NOT EXISTS calorie_counter;

USE calorie_counter;


CREATE TABLE Patients ( id INT PRIMARY KEY AUTO_INCREMENT,
                                           first_name VARCHAR(50) NOT NULL,
                                                                  last_name VARCHAR(50) NOT NULL);


CREATE TABLE FoodItems ( id INT PRIMARY KEY AUTO_INCREMENT,
                                            name VARCHAR(100) NOT NULL,
                                                              calories_per_100g FLOAT NOT NULL,
                                                                                      is_deleted BOOLEAN DEFAULT FALSE);


CREATE TABLE FoodLogs ( id INT PRIMARY KEY AUTO_INCREMENT,
                                           patient_id INT NOT NULL,
                                                          food_item_id INT NOT NULL,
                                                                           quantity_g FLOAT NOT NULL, date DATE NOT NULL,
                       FOREIGN KEY (patient_id) REFERENCES Patients(id),
                       FOREIGN KEY (food_item_id) REFERENCES FoodItems(id));