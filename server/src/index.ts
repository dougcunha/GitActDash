import './config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import apiRouter from './routes/api';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
