import { apiSlice } from "./apiSlice";
import { Deal, DealStage, DealStatus } from "../types";

interface DealsResponse {
    success: boolean;
    count: number;
    deals: Deal[];
}

interface DealResponse {
    success: boolean;
    message: string;
    data: Deal;
}

export interface CreateDealPayload {
    counterpartyId: string;
    title: string;
    amount: number;
    equity: number;
    stage: DealStage;
    notes?: string;
    expectedCloseDate?: string;
}

export interface UpdateDealPayload {
    dealId: string;
    title?: string;
    amount?: number;
    equity?: number;
    stage?: DealStage;
    notes?: string;
    expectedCloseDate?: string;
}

export const dealApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createDeal: builder.mutation<DealResponse, CreateDealPayload>({
            query: (dealData) => ({
                url: "/deal/create",
                method: "POST",
                body: dealData,
            }),
            invalidatesTags: [{ type: "Deal", id: "LIST" }],
        }),
        getMyDeals: builder.query<
            DealsResponse,
            { status?: DealStatus } | void
        >({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params?.status) {
                    queryParams.set("status", params.status);
                }

                const querySuffix = queryParams.toString();
                return {
                    url: `/deal/my-deals${querySuffix ? `?${querySuffix}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.deals.map((deal) => ({
                              type: "Deal" as const,
                              id: deal._id,
                          })),
                          { type: "Deal", id: "LIST" },
                      ]
                    : [{ type: "Deal", id: "LIST" }],
        }),
        updateDealStatus: builder.mutation<
            DealResponse,
            { dealId: string; status: DealStatus }
        >({
            query: (payload) => ({
                url: "/deal/status",
                method: "PUT",
                body: payload,
            }),
            invalidatesTags: (_result, _error, payload) => [
                { type: "Deal", id: payload.dealId },
                { type: "Deal", id: "LIST" },
            ],
        }),
        updateDeal: builder.mutation<DealResponse, UpdateDealPayload>({
            query: (payload) => ({
                url: "/deal/update",
                method: "PUT",
                body: payload,
            }),
            invalidatesTags: (_result, _error, payload) => [
                { type: "Deal", id: payload.dealId },
                { type: "Deal", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useCreateDealMutation,
    useGetMyDealsQuery,
    useUpdateDealMutation,
    useUpdateDealStatusMutation,
} = dealApi;
