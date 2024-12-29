import express from 'express';
import cors from 'cors';
import processRoutes from './routes/process';
import videoRoutes from './routes/video';

const app = express();
const port = 3000;

app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use('/process', processRoutes);
app.use('/video', videoRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
