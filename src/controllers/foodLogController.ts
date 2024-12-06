import { IncomingMessage, ServerResponse } from 'http';
import pool from '../util/database';
import { parseBody, notFound, methodNotAllowed, internalError } from '../util/helpers';
import { FieldPacket, ResultSetHeader } from 'mysql2';
import { Patient } from '../models/Patient';
import { FoodItem } from '../models/FoodItem';
import { ParsedUrlQuery } from 'querystring';
import { FoodLog } from '../models/FoodLog';

export class FoodLogController {
    static async handle(req: IncomingMessage, res: ServerResponse) {
        console.log("In FoodLogController");
        const method = req.method;
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[2];

        switch(method) {
            case 'POST': 
                await this.createFoodLog(req, res);
                break;
            case 'DELETE':
                if (id) {
                    await this.deleteFoodLog(id, res);
                } else {
                    notFound(res);
                }
                break;
            case 'PUT':
                if (id) {
                    await this.updateFoodLog(id, req, res);
                } else {
                    notFound(res);
                }
                break;
            default:
                methodNotAllowed(res);
        }
    }

    static async createFoodLog(req: IncomingMessage, res: ServerResponse) {
        try {
            const body = await parseBody<FoodLog>(req);
            const { patientId, foodItemId, quantityG, date } = body;

            if (!patientId || !foodItemId || !quantityG || !date) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'All fields are required' }));
                return;
            }

            const currentDate = new Date();
            const logDate = new Date(date);

            if (isNaN(logDate.getTime()) || logDate > currentDate) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid or future date is not allowed' }));
                return;
            }

            const patientExists = await this.doesPatientExist(patientId);
            if(!patientExists){
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Patient does not exist' }));
                return;
            }

            const [foodRows, fields]: [FoodItem[], FieldPacket[]] = await pool.execute<FoodItem[]>('SELECT * FROM FoodItems WHERE id = ? AND is_deleted = FALSE', [foodItemId]);
            if (foodRows.length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Food item does not exist or has been deleted' }));
                return;
            }

            const utcDate = logDate.toISOString().split('T')[0];

            const [result]: [ResultSetHeader, FieldPacket[]] = await pool.execute<ResultSetHeader>(
                'INSERT INTO FoodLogs (patient_id, food_item_id, quantity_g, date) VALUES (?, ?, ?, ?)',
                [patientId, foodItemId, quantityG, utcDate]
            );

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id: result.insertId, patientId, foodItemId, quantityG, date: utcDate }));
        } catch (error) {
            internalError(res, error);
        }
    }
    static async deleteFoodLog(id: string, res: ServerResponse) {
        try{
            const [result]: [ResultSetHeader, FieldPacket[]] = await pool.execute<ResultSetHeader>(
                'DELETE FROM FoodLogs WHERE id = ?', [id]
            );

            if (result.affectedRows === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Food log not found' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Food item deleted successfully' }));
            }
        } catch (error) {
            internalError(res, error);
        }
    };
    static async updateFoodLog(id: string, req: IncomingMessage, res: ServerResponse) {
        try {
            const body = await parseBody<FoodLog>(req);
            const { patientId, foodItemId, quantityG, date } = body;

            let query = 'UPDATE FoodLogs SET ';
            const params: any[] = [];
            if (patientId) {
                const [patientRows]: [Patient[], FieldPacket[]] = await pool.execute<Patient[]>('SELECT * FROM Patients WHERE id = ?', [patientId]);
                if (patientRows.length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Patient does not exist' }));
                    return;
                }
                query += 'patient_id = ?, ';
                params.push(patientId);
            }
            if (foodItemId) {
                const [foodRows, fields]: [FoodItem[], FieldPacket[]] = await pool.execute<FoodItem[]>('SELECT * FROM FoodItems WHERE id = ? AND is_deleted = FALSE', [foodItemId]);
                if (foodRows.length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Food item does not exist or has been deleted' }));
                    return;
                }
                query += 'food_item_id = ?, ';
                params.push(foodItemId);
            }
            if (quantityG) {
                query += 'quantity_g = ?, ';
                params.push(quantityG);
            }
            if (date) {
                query += 'date = ?, ';

                const currentDate = new Date();
                const logDate = new Date(date);

                if (isNaN(logDate.getTime()) || logDate > currentDate) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Invalid or future date is not allowed' }));
                    return;
                }

                const utcDate = logDate.toISOString().split('T')[0];
                params.push(utcDate);
            }
            query = query.slice(0, -2); 
            query += ' WHERE id = ?';
            params.push(id);

            const [result]: [ResultSetHeader, FieldPacket[]] = await pool.query<ResultSetHeader>(query, params);

            if (result.affectedRows === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Food log not found' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Food log updated successfully', foodLog: {id, patientId, foodItemId, quantityG, date} }));
            }
        } catch (error) {
            internalError(res, error);
        }
    }

    static async getConsumedCalories(req: IncomingMessage , res: ServerResponse, query: ParsedUrlQuery) {
        const patientId = query.patientId;
        const date = query.date;

        if (!patientId || !date) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'patientId and date are required' }));
            return;
        }

        const patientExists = await this.doesPatientExist(+patientId);
        if(!patientExists){
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Patient does not exist' }));
            return;
        }

        try {
            const [rows]: any = await pool.query(
                `
                SELECT SUM(FoodItems.calories_per_100g * FoodLogs.quantity_g / 100) as total_calories
                FROM FoodLogs
                JOIN FoodItems ON FoodLogs.food_item_id = FoodItems.id
                WHERE FoodLogs.patient_id = ? AND FoodLogs.date = ?
                `,
                [patientId, date]
            );

            const totalCalories = rows[0].total_calories || 0;
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ patientId, date, totalCalories }));
        } catch (error) {
            internalError(res, error);
        }
    }    

    static async doesPatientExist(patientId: number): Promise<boolean> {
        const [patientRows]: [Patient[], FieldPacket[]] = await pool.execute<Patient[]>(
            'SELECT * FROM Patients WHERE id = ?', [patientId]);
        if (patientRows.length === 0) {
            return false;
        } 
        return true;
    }

};