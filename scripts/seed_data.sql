USE calorie_counter;


INSERT INTO Patients (first_name, last_name)
VALUES ('Test',
        'One'), ('Test',
                 'Two');


INSERT INTO FoodItems (name, calories_per_100g)
VALUES ('Apple',
        52), ('Banana',
              96), ('Chicken Breast',
                    165);


INSERT INTO FoodLogs (patient_id, food_item_id, quantity_g, date)
VALUES (1,
        1,
        150,
        '2024-04-01'), (1,
                        3,
                        200,
                        '2024-04-01'), (2,
                                        2,
                                        120,
                                        '2024-04-01');