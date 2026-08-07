import toast from "react-hot-toast";
import {
  createOrder,
  verifyPayment,
  loadRazorpayScript,
} from "./paymentService";

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    source?: string;
    step?: string;
    reason?: string;
  };
}

export interface OpenCheckoutParams {
  user: { fullName?: string; name?: string; email?: string } | null;
  refreshSubscription: () => Promise<void>;
  onSuccess?: () => void;
  onFailure?: (error: unknown) => void;
}

/**
 * Opens Razorpay Checkout overlay for PRO membership upgrade.
 * Workflow:
 * 1. Create Razorpay order via backend POST /payment/create-order
 * 2. Dynamically load Razorpay SDK script
 * 3. Open Razorpay Checkout modal with prefilled user details
 * 4. On payment authorization, verify HMAC signature via backend POST /payment/verify
 * 5. Synchronize live user subscription state in AuthContext
 */
export const openRazorpayCheckout = async ({
  user,
  refreshSubscription,
  onSuccess,
  onFailure,
}: OpenCheckoutParams): Promise<void> => {
  try {
    // 1. Create backend Razorpay order
    const order = await createOrder("PRO");

    // 2. Load Razorpay SDK
    const loaded = await loadRazorpayScript();

    if (!loaded || !window.Razorpay) {
      throw new Error("Unable to load Razorpay Checkout script.");
    }

    const razorpay = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: "Code Snippet Platform",
      description: "PRO Membership Upgrade",
      prefill: {
        name: user?.fullName || user?.name || "Developer",
        email: user?.email || "",
      },
      handler: async (response: RazorpaySuccessResponse) => {
        try {
          await verifyPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          await refreshSubscription();
          toast.success("🎉 Welcome to PRO!");
          onSuccess?.();
        } catch (verifyErr) {
          console.error("Payment verification failed:", verifyErr);
          toast.error("Payment verification failed.");
          onFailure?.(verifyErr);
        }
      },
    });

    razorpay.on("payment.failed", (response: RazorpayErrorResponse) => {
      console.error("Razorpay payment failed:", response.error);
      toast.error(response.error?.description || "Payment authorization failed.");
      onFailure?.(response.error);
    });

    razorpay.open();
  } catch (error) {
    console.error("Unable to start checkout:", error);
    toast.error("Unable to start payment.");
    onFailure?.(error);
  }
};
