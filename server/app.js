import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import Router from './src/Routers/router.js';
import uploadRouter from './src/Routers/uploadRouter.js'; 
import { connectDB } from './src/config/db.js';
import NovaPoshtaRouter from './src/Routers/NovaPoshtaRouter.js';
import cors from 'cors';

const app = express()

connectDB()
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', Router);
app.use('/api', uploadRouter);
app.use('/api', NovaPoshtaRouter);

app.get('/', (req, res) => {
  res.send('Hello World!')
  console.log(req.query)

})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})