export class VNPay {
  constructor(config: {
    tmnCode: string;
    secureSecret: string;
    vnpayHost: string;
    testMode: boolean;
  });

  buildPaymentUrl(params: {
    vnp_Amount: number;
    vnp_IpAddr: string;
    vnp_TxnRef: string;
    vnp_OrderInfo: string;
    vnp_OrderType: string;
    vnp_ReturnUrl: string;
    vnp_Locale: string;
  }): Promise<string>;

  verifyReturnUrl(query: any): Promise<{
    isSuccess: boolean;
    message?: string;
  }>;
}

export enum ProductCode {
  Other = 'other',
}

export enum VnpLocale {
  VN = 'vn',
}
