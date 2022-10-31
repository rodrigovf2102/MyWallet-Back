import express from 'express';
import cors from 'cors';
import router from './routes/indexRoutes.js';

dotenv.config();

const server = express();
server.use(cors());
server.use(express.json());

server.use(router);

const port = process.env.PORT

server.listen(port, ()=>{"Server ON: "+process.env.PORT});