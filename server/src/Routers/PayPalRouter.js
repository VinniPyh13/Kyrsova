import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const {
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET
} = process.env;

const baseURL = 'https://api-m.sandbox.paypal.com'; // або live для продакшну

const getAccessToken = async () => {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await axios.post(`${baseURL}/v1/oauth2/token`, 'grant_type=client_credentials', {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  });
  return res.data.access_token;
};

// /api/paypal/token
router.get('/token', async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    res.json({ accessToken });
  } catch (err) {
    console.error('PayPal token error:', err.message);
    res.status(500).json({ error: 'Не вдалося отримати токен PayPal' });
  }
});

// /api/paypal/verify/:paymentId
router.get('/verify/:paymentId', async (req, res) => {
  const { paymentId } = req.params;
  try {
    const accessToken = await getAccessToken();
    const response = await axios.get(`${baseURL}/v2/checkout/orders/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });
    const isCompleted = response.data.status === 'COMPLETED';
    res.json({ valid: isCompleted });
  } catch (err) {
    console.error('PayPal verification error:', err.message);
    res.status(500).json({ error: 'Помилка перевірки платежу' });
  }
});

export default router;
