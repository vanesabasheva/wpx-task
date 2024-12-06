import { RowDataPacket } from "mysql2";

export interface FoodItem extends RowDataPacket {
    id: number;
    name: string;
    caloriesPer100g: number;
    isDeleted: boolean;
}