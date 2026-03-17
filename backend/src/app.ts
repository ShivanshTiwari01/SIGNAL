import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message:
      'Unauthorized Access. Your access has been reported to the authorities.',
  });
});

export default app;
