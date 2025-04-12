export class VNPay {
  constructor(config: {
    tmnCode: string;
    secureSecret: string;
    vnpayHost: string;
    testMode: boolean;
  }) {
    // Implementation will be added here
  }

  async buildPaymentUrl(params: {
    vnp_Amount: number;
    vnp_IpAddr: string;
    vnp_TxnRef: string;
    vnp_OrderInfo: string;
    vnp_OrderType: string;
    vnp_ReturnUrl: string;
    vnp_Locale: string;
  }): Promise<string> {
    // Implementation will be added here
    return '';
  }

  async verifyReturnUrl(query: any): Promise<{
    isSuccess: boolean;
    message?: string;
  }> {
    // Implementation will be added here
    return { isSuccess: false };
  }
}

export enum ProductCode {
  Other = 'other',
}

export enum VnpLocale {
  VN = 'vn',
}
