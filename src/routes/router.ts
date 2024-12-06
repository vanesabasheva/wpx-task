import { IncomingMessage, ServerResponse } from 'http';
import { PatientController } from '../controllers/patientController';
import { FoodItemController } from '../controllers/foodItemController';
import { FoodLogController } from "../controllers/foodLogController";
const querystring = require('querystring');
const url = require('url');

export const router = (req: IncomingMessage, res: ServerResponse) => {
    const method = req.method;
    const myurl = req.url;
   
    var queryData = url.parse(req.url, true).query;
    console.log(queryData);
    //const parsed = url.parse(req.url);
    //const query = querystring.parse(parsed.query);

    const parsedUrl = new URL(`http://${req.headers.host}${req.url}`);
    const pathname = parsedUrl.pathname;
    const query = Object.fromEntries(parsedUrl.searchParams.entries());

    //console.log(req);
    console.log('URL:', parsedUrl);
    console.log(pathname);

    if (myurl?.startsWith('/patients')) {
        PatientController.handle(req, res);
    } else if (myurl?.startsWith('/food-items')) {
       FoodItemController.handle(req, res);
    } else if (myurl?.startsWith('/food-logs')) {
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