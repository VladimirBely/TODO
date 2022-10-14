import http from 'http';
import fs from 'fs';
import common from './common.js';
import { nanoid } from 'nanoid';
const DB_FILE_PATH = './DB/cards.json';

const PORT = 8080;

function getRequest(request, response) {
    if (request.url !== '/api') {
        response.statusCode = 404;
        response.end('Not found');
        return;
    }

    response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    response.setHeader('Access-Control-Allow-Methods', 'DELETE, PUT');

    let cards = fs.readFileSync(DB_FILE_PATH, { encoding: 'utf-8' });

    if (cards.length === 0) {
        cards = "[]";
    }

    let cardsArr = JSON.parse(cards);

    if (request.method === 'OPTIONS') {
        response.end();
    }

    if (request.method === 'GET') {
        response.statusCode = 200;
        response.end(common.generateResponseData({ status: 0, data: cards }));
    }

    if (request.method === 'POST') {
        request.on('data', data => {
            common.checkDataLength(request, data);

            data = common.parseJSON(data, response);
            if (!data) return;

            data.id = nanoid();
            cardsArr.push(data);

            common.writeFile(DB_FILE_PATH, cardsArr);

            response.statusCode = 200;
            response.end(common.generateResponseData({ status: 0, data }));
        });
    }

    if (request.method === 'DELETE') {
        request.on('data', data => {
            common.checkDataLength(request, data);

            data = common.parseJSON(data, response);
            if (!data) return;

            cardsArr = cardsArr.filter(cards => {
                return cards.id !== data.id;
            });

            common.writeFile(DB_FILE_PATH, cardsArr);

            response.statusCode = 200;
            response.end(common.generateResponseData({ status: 0, data: cards }));
        });
    }

    if (request.method === 'PUT') {
        request.on('data', data => {
            common.checkDataLength(request, data);

            data = common.parseJSON(data, response);
            if (!data) return;

            if (!cardsArr.some(card => card.id === data.id)) {
                response.statusCode = 400;
                response.end(common.generateResponseData({ status: 1, errorText: "Card doesn't exist" }));
            }

            cardsArr.forEach((card, index) => {
                if (card.id === data.id) {
                    cardsArr[index] = data;
                }
            });

            common.writeFile(DB_FILE_PATH, cardsArr);

            response.statusCode = 200;
            response.end(common.generateResponseData({ status: 0, data: cards }));
        });
    }
}

let server = http.createServer(getRequest);

server.listen(PORT);

console.log(`Server starts listening on port ${PORT}`);