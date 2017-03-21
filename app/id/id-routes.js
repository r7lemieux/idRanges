"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const id_service_1 = require("./id-service");
const express = require("express");
const app = express();
function idRoutes(app) {
    console.log(`=> id-routes:8 `);
    app.get('/api/id', (req, res) => {
        res.send('GET request to id route');
    });
    app.get('/api/generateId', (req, res) => {
        id_service_1.idService.generateId(req.query.key, res);
    });
    app.get('/api/allocatedRanges', (req, res) => {
        id_service_1.idService.getAllocatedRanges(req.query.key, res);
    });
    app.post('/', (req, res) => {
        res.send('POST request to id route');
    });
}
exports.idRoutes = idRoutes;
//# sourceMappingURL=id-routes.js.map