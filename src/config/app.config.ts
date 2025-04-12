export default () => ({
  // ... other config ...
  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE,
    secureSecret: process.env.VNPAY_SECURE_SECRET,
    vnpayHost: process.env.VNPAY_HOST,
    testMode: process.env.VNPAY_TEST_MODE === 'true',
    returnUrl: process.env.VNPAY_RETURN_URL,
  },
});
