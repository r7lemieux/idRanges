import {idService} from "./id-service";
import {Application, Request, Response} from 'express';
import * as express from 'express'

const app = express();

export function idRoutes(app) {
  console.log(`=> id-routes:8 `);
  app.get('/api/id', (req, res) => {
    res.send('GET request to id route')
  });

  app.get('/api/generateId', (req , res) => {
    idService.generateId(req.query.key, res)
  });

  app.get('/api/allocatedRanges', (req , res) => {
    idService.getAllocatedRanges(req.query.key, res)
  });

  app.post('/', (req, res) => {
    res.send('POST request to id route')
  })
}
