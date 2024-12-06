import { RowDataPacket } from "mysql2";

export interface Patient extends RowDataPacket {
    id: number;
    firstName: string;
    lastName: string;
}