import React from "react";
import { DollarSign, TrendingUp, Users } from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useGetSuccessfulDealPaymentsQuery } from "../../services/payment.service";
import { useSelector } from "react-redux";
import { IAuthProps } from "../../features/auth.slice";

export const PaymentHistoryCard: React.FC = () => {
    const user = useSelector((state: { auth: IAuthProps }) => state.auth);
    const { data: paymentsData, isLoading } =
        useGetSuccessfulDealPaymentsQuery();

    const payments = paymentsData?.payments || [];

    if (!user?._id) return null;

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount);
    };

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-success-100 rounded-lg">
                        <DollarSign size={20} className="text-success-700" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Payment History</h2>
                        <p className="text-sm text-gray-600">
                            All successful deal payments
                        </p>
                    </div>
                </div>
                <Badge variant="success" size="sm">
                    {payments.length} payments
                </Badge>
            </CardHeader>

            <CardBody>
                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">
                        Loading payments...
                    </div>
                ) : payments.length > 0 ? (
                    <div className="space-y-3">
                        {payments.map((payment: any) => {
                            const isPayer = payment.paidBy._id === user._id;
                            const otherParty = isPayer
                                ? payment.receivedBy
                                : payment.paidBy;
                            const dealTitle = payment.dealId?.title || "Deal";

                            return (
                                <div
                                    key={payment._id}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {dealTitle}
                                                </h3>
                                                {isPayer ? (
                                                    <Badge
                                                        variant="secondary"
                                                        size="sm"
                                                    >
                                                        You Paid
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="success"
                                                        size="sm"
                                                    >
                                                        You Received
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                <div className="flex items-center gap-1">
                                                    <Users size={14} />
                                                    <span>
                                                        {otherParty.name}
                                                    </span>
                                                </div>
                                                <div>
                                                    {new Date(
                                                        payment.createdAt,
                                                    ).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-lg font-bold text-gray-900">
                                                {formatCurrency(
                                                    payment.amount,
                                                    payment.currency,
                                                )}
                                            </div>
                                            <Badge
                                                variant="success"
                                                size="sm"
                                                className="mt-1"
                                            >
                                                Completed
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                            <TrendingUp size={24} className="text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">
                            No payments yet
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Successful deal payments will appear here
                        </p>
                    </div>
                )}
            </CardBody>
        </Card>
    );
};
