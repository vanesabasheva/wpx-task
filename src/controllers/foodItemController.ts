import { IncomingMessage, ServerResponse } from 'http';
import pool from '../util/database';
import { parseBody, internalError, methodNotAllowed, notFound } from '../util/helpers';
import { FieldPacket, ResultSetHeader } from 'mysql2';
import { FoodItem } from '../models/FoodItem';

export class FoodItemController {
    static async handle(req: IncomingMessage, res: ServerResponse) {
        const method = req.method;
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[2];

        switch(method) {
            case 'POST': 
                await this.createFoodItem(req, res);
                break;
            case 'DELETE':
                if (id) {
                    await this.deleteFoodItem(id, res);
                } else {
                    notFound(res);
                }
                break;
            default:
                methodNotAllowed(res);
        }
    };

    static async createFoodItem(req: IncomingMessage, res: ServerResponse) {
        try {
            const body = await parseBody<FoodItem>(req);
            const {name, caloriesPer100g} = body;
            if (!name || !caloriesPer100g) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Name and calories_per_100g are required' }));
                return;
            }

            const [result]: [ResultSetHeader, FieldPacket[]] = await pool.execute<ResultSetHeader>(
                'INSERT INTO FoodItems (name, calories_per_100g) VALUES (?, ?)',
                [name, caloriesPer100g]
            );
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id: result.insertId, name, caloriesPer100g }));
        } catch(error) {
            internalError(res, error);
        }
    };

    static async deleteFoodItem(id: string, res: ServerResponse) {
        try{
            const [result]: [ResultSetHeader, FieldPacket[]] = await pool.execute<ResultSetHeader>(
                'UPDATE FoodItems SET is_deleted = TRUE WHERE id = ?', 
                [id]
            );

            if (result.affectedRows === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Food item not found' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Food item deleted successfully' }));
            }
        } catch (error) {
            internalError(res, error);
        }
    };
};