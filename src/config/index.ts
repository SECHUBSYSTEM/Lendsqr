import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'demo_credit',
    testName: process.env.DB_NAME_TEST || 'demo_credit_test',
  },
  
  adjutor: {
    apiKey: process.env.ADJUTOR_API_KEY || '',
    baseUrl: 'https://adjutor.lendsqr.com/v2',
  },
};
