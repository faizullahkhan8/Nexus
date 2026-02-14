import { apiSlice } from "./apiSlice";

export interface DealPaymentPayload {
    dealId: string;
    amount: number;
    currency?: string;
    success_url?: string;
    cancel_url?: string;
}

interface CheckoutSessionResponse {
    success: boolean;
    url?: string;
    id: string;
    message?: string;
}

interface DealPaymentResponse {
    success: boolean;
    count: number;
    payments: any[];
}

interface VerifyPaymentResponse {
    success: boolean;
    message: string;
    paymentId?: string;
}

export const paymentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createDealPayment: builder.mutation<
            CheckoutSessionResponse,
            DealPaymentPayload
        >({
            query: (payload) => ({
                url: "/stripe/create-deal-payment",
                method: "POST",
                body: payload,
            }),
            invalidatesTags: [{ type: "Payment", id: "LIST" }],
        }),
        getSuccessfulDealPayments: builder.query<DealPaymentResponse, void>({
            query: () => ({
                url: "/stripe/successful-payments",
                method: "GET",
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.payments.map((payment) => ({
                              type: "Payment" as const,
                              id: payment._id,
                          })),
                          { type: "Payment", id: "LIST" },
                      ]
                    : [{ type: "Payment", id: "LIST" }],
        }),
        getPaymentsByDeal: builder.query<DealPaymentResponse, string>({
            query: (dealId) => ({
                url: `/stripe/deal-payments/${dealId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, dealId) => [
                { type: "Payment", id: dealId },
            ],
        }),
        verifyPayment: builder.query<VerifyPaymentResponse, string>({
            query: (sessionId) => ({
                url: "/stripe/verify-payment",
                method: "GET",
                params: { session_id: sessionId },
            }),
            providesTags: (_result, _error, sessionId) => [
                { type: "Payment", id: sessionId },
            ],
        }),
    }),
});

export const {
    useCreateDealPaymentMutation,
    useGetSuccessfulDealPaymentsQuery,
    useGetPaymentsByDealQuery,
    useVerifyPaymentQuery,
} = paymentApi;
