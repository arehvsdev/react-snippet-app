import { apiClient } from "./apiClient";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  data?: any;
}

export interface VerifyPaymentPayload {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  data?: any;
  subscription?: {
    plan: string;
    status: string;
    paymentId: string;
  };
}

/**
 * Dynamically loads the Razorpay checkout.js script into the DOM.
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById("razorpay-checkout-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
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
 * Calls backend API to create a Razorpay order.
 */
export const createOrder = async (plan: string = "PRO"): Promise<CreateOrderResponse> => {
  const resData = await apiClient.post("/payment/create-order", { plan });
  return {
    success: resData.success !== false,
    orderId: resData.orderId || resData.data?.orderId,
    amount: resData.amount || resData.data?.amount,
    currency: resData.currency || resData.data?.currency,
    keyId: resData.keyId || resData.data?.keyId,
    data: resData.data,
  };
};

/**
 * Calls backend API to verify Razorpay payment signature and activate PRO membership.
 */
export const verifyPayment = async (payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> => {
  const resData = await apiClient.post("/payment/verify", payload);
  return {
    success: resData.success !== false,
    message: resData.message,
    data: resData.data,
    subscription: resData.subscription || resData.data?.subscription,
  };
};
