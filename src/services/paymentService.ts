import { apiClient } from "./apiClient";

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

export interface SubscriptionData {
  plan: "FREE" | "PRO";
  status: string;
  paymentId: string | null;
  paymentDate: string | null;
}

export interface PaymentRecord {
  _id: string;
  plan: "FREE" | "PRO" | string;
  amount: number;
  currency: string;
  orderId: string;
  paymentId: string | null;
  status: "CREATED" | "SUCCESS" | "FAILED";
  gateway: string;
  createdAt: string;
}

export interface PaymentHistoryResponse {
  payments: PaymentRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Dynamically loads Razorpay checkout script into the page.
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Fetches authenticated user's subscription details via GET /subscription.
 */
export const getSubscription = async (): Promise<SubscriptionData> => {
  const resData = await apiClient.get("/subscription");
  const subData = resData.data?.subscription || resData.data || resData.subscription || resData;
  return subData;
};

/**
 * Fetches authenticated user's payment history via GET /payment/history.
 */
export const getPaymentHistory = async (
  page = 1,
  limit = 10
): Promise<PaymentHistoryResponse> => {
  const resData = await apiClient.get(
    `/payment/history?page=${page}&limit=${limit}`
  );
  return {
    payments: resData.data || resData.payments || [],
    pagination: resData.pagination || {
      total: 0,
      page,
      limit,
      pages: 1,
    },
  };
};

/**
 * Creates a Razorpay order via POST /payment/create-order.
 */
export const createOrder = async (plan: string = "PRO") => {
  const resData = await apiClient.post("/payment/create-order", { plan });
  return resData.data || resData;
};

/**
 * Verifies Razorpay payment signature via POST /payment/verify.
 */
export const verifyPayment = async (payload: {
  orderId: string;
  paymentId: string;
  signature: string;
}) => {
  const resData = await apiClient.post("/payment/verify", payload);
  return resData.data || resData;
};
