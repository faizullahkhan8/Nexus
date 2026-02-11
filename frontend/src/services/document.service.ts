import { apiSlice } from "./apiSlice";

export const documentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        uploadDocument: builder.mutation({
            query: (formData) => ({
                url: "/document/upload",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [{ type: "Document", id: "LIST" }],
        }),
        getDocuments: builder.query<any, void>({
            query: () => "/document",
            providesTags: (result) =>
                result?.data
                    ? [
                          ...result.data.map(({ _id }: any) => ({
                              type: "Document" as const,
                              id: _id,
                          })),
                          { type: "Document", id: "LIST" },
                      ]
                    : [{ type: "Document", id: "LIST" }],
        }),
        deleteDocument: builder.mutation({
            query: (id: string) => ({
                url: `/document/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Document", id: "LIST" }],
        }),
    }),
});

export const {
    useUploadDocumentMutation,
    useGetDocumentsQuery,
    useDeleteDocumentMutation,
} = documentApi;
