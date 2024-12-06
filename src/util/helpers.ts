import { IncomingMessage, ServerResponse } from 'http';

export const parseBody = <T = any>(req: IncomingMessage): Promise<T> => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const parsed: T = JSON.parse(body);
                resolve(parsed);
            } catch (error) {
                reject(error);
            }
        });
    });
};

export const internalError = (res: ServerResponse, error: any) => {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal Server Error' }));
}

export const methodNotAllowed = (res: ServerResponse) => {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Method Not Allowed' }));
}

export const notFound = (res: ServerResponse) => {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not Found' }));
}
