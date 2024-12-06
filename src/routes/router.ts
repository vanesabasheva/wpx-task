import { IncomingMessage, ServerResponse } from 'http';
import { PatientController } from '../controllers/patientController';
import { FoodItemController } from '../controllers/foodItemController';
import { FoodLogController } from "../controllers/foodLogController";

export const router = (req: IncomingMessage, res: ServerResponse) => {
    const method = req.method;
    const url = req.url;

    const parsedUrl = new URL(`http://${req.headers.host}${req.url}`);
    const pathname = parsedUrl.pathname;
    const query = Object.fromEntries(parsedUrl.searchParams.entries());

    if (url?.startsWith('/patients')) {
        PatientController.handle(req, res);
    } else if (url?.startsWith('/food-items')) {
       FoodItemController.handle(req, res);
    } else if (url?.startsWith('/food-logs')) {
        if (pathname === '/food-logs/calories' && method === 'GET') {
            FoodLogController.getConsumedCalories(req, res, query)
        } else {
            FoodLogController.handle(req, res);
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Route not found' }));
    }
};