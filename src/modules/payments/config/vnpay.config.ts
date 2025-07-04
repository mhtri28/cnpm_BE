import { registerAs } from '@nestjs/config';

export default registerAs('vnpay', () => ({
  tmnCode: process.env.VNPAY_TMN_CODE || 'TESTCODE',
  secureSecret: process.env.VNPAY_SECURE_SECRET || 'TESTSECRET',
  vnpayHost: process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn',
  returnUrl:
    process.env.VNPAY_RETURN_URL ||
    'https://cnpm-be-vagn.onrender.com/api/v1/payments/vnpay-return',
  ipnUrl:
    process.env.VNPAY_IPN_URL ||
    'https://cnpm-be-vagn.onrender.com/api/v1/payments/vnpay-ipn',
  testMode: process.env.NODE_ENV !== 'production',
}));
