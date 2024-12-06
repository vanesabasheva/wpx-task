import { IncomingMessage, ServerResponse } from 'http';
import pool from '../util/database';
import { parseBody, internalError, methodNotAllowed } from '../util/helpers';
import { FieldPacket, ResultSetHeader } from 'mysql2';
import { Patient } from '../models/Patient';

export class PatientController {
    static async handle(req: IncomingMessage, res: ServerResponse) {
        const method = req.method;

        switch(method) {
            case 'POST': 
                await this.createPatient(req,res);
                break;

            default:
                methodNotAllowed(res);
        }
    }

    static async createPatient(req: IncomingMessage, res: ServerResponse) {
        try {
            const body = await parseBody<Patient>(req);
            const {firstName, lastName} = body;
    
            if (!firstName || !lastName) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'First and last name are required' }));
                return;
            }

            const [result]: [ResultSetHeader, FieldPacket[]] = await pool.execute<ResultSetHeader>(
                'INSERT INTO Patients (first_name, last_name) VALUES (?, ?)',
                [firstName, lastName]
            );
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id: result.insertId, firstName, lastName }));
        } catch (error) {
            internalError(res, error)
        }
    }
};