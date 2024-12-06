import http, { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { router } from './routes/router';

const PORT = 3000;

const requestListener = (req: IncomingMessage, res: ServerResponse) => {
    const parsedUrl = parse(req.url || '', true);
    req.url = parsedUrl.pathname || '/';
    (req as any).query = parsedUrl.query;
    router(req, res);
};

const server = http.createServer(requestListener);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});