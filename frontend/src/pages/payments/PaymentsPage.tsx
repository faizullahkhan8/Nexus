import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
    DollarSign,
    TrendingUp,
    Users,
    ArrowDownRight,
    ArrowUpRight,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { IAuthProps } from "../../features/auth.slice";
import { useGetSuccessfulDealPaymentsQuery } from "../../services/payment.service";

type PaymentFilter = "all" | "sent" | "received";

export const PaymentsPage: React.FC = () => {
    const user = useSelector((state: { auth: IAuthProps }) => state.auth);
    const [filter, setFilter] = useState<PaymentFilter>("all");
    const { data: paymentsData, isLoading } =
        useGetSuccessfulDealPaymentsQuery();

    const payments = paymentsData?.payments || [];

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount);
    };

    const filteredPayments = useMemo(() => {
        if (!user?._id) return [];

        return payments.filter((payment: any) => {
            const isPayer = payment.paidBy._id === user._id;

            if (filter === "sent") return isPayer;
            if (filter === "received") return !isPayer;
            return true;
        });
    }, [payments, filter, user?._id]);

    const stats = useMemo(() => {
        const sentAmount = payments
            .filter((p: any) => p.paidBy._id === user._id)
            .reduce((sum: number, p: any) => sum + p.amount, 0);

        const receivedAmount = payments
            .filter((p: any) => p.receivedBy._id === user._id)
            .reduce((sum: number, p: any) => sum + p.amount, 0);

        return { sentAmount, receivedAmount };
    }, [payments, user?._id]);

    if (!user?._id) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
                <p className="text-gray-600">
                    Track all your deal payments and received amounts
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-secondary-50 border border-secondary-100">
                    <CardBody>
                        <div className="flex items-center">
                            <div className="p-3 bg-secondary-100 rounded-full mr-4">
                                <DollarSign
                                    size={20}
                                    className="text-secondary-700"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-secondary-700">
                                    Total Payments
                                </p>
                                <h3 className="text-xl font-semibold text-secondary-900">
                                    {payments.length}
                                </h3>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-accent-50 border border-accent-100">
                    <CardBody>
                        <div className="flex items-center">
                            <div className="p-3 bg-accent-100 rounded-full mr-4">
                                <ArrowUpRight
                                    size={20}
                                    className="text-accent-700"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-accent-700">
                                    Amount Sent
                                </p>
                                <h3 className="text-xl font-semibold text-accent-900">
                                    {formatCurrency(stats.sentAmount, "usd")}
                                </h3>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-success-50 border border-success-100">
                    <CardBody>
                        <div className="flex items-center">
                            <div className="p-3 bg-success-100 rounded-full mr-4">
                                <ArrowDownRight
                                    size={20}
                                    className="text-success-700"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-success-700">
                                    Amount Received
                                </p>
                                <h3 className="text-xl font-semibold text-success-900">
                                    {formatCurrency(
                                        stats.receivedAmount,
                                        "usd",
                                    )}
                                </h3>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Payment List */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center gap-4">
                        <h2 className="text-lg font-bold">Payment History</h2>
                        <div className="flex gap-2">
                            {(
                                ["all", "sent", "received"] as PaymentFilter[]
                            ).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        filter === f
                                            ? "bg-primary-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>

                <CardBody>
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">
                            Loading payments...
                        </div>
                    ) : filteredPayments.length > 0 ? (
                        <div className="space-y-3">
                            {filteredPayments.map((payment: any) => {
                                const isPayer = payment.paidBy._id === user._id;
                                const otherParty = isPayer
                                    ? payment.receivedBy
                                    : payment.paidBy;
                                const dealTitle =
                                    payment.dealId?.title || "Deal";

                                return (
                                    <div
                                        key={payment._id}
                                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div
                                                        className={`p-2 rounded-full ${
                                                            isPayer
                                                                ? "bg-accent-100"
                                                                : "bg-success-100"
                                                        }`}
                                                    >
                                                        {isPayer ? (
                                                            <ArrowUpRight
                                                                size={16}
                                                                className={
                                                                    isPayer
                                                                        ? "text-accent-600"
                                                                        : "text-success-600"
                                                                }
                                                            />
                                                        ) : (
                                                            <ArrowDownRight
                                                                size={16}
                                                                className={
                                                                    isPayer
                                                                        ? "text-accent-600"
                                                                        : "text-success-600"
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {dealTitle}
                                                    </h3>
                                                    {isPayer ? (
                                                        <Badge
                                                            variant="secondary"
                                                            size="sm"
                                                        >
                                                            Sent
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="success"
                                                            size="sm"
                                                        >
                                                            Received
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
                                                <div
                                                    className={`text-lg font-bold ${
                                                        isPayer
                                                            ? "text-accent-600"
                                                            : "text-success-600"
                                                    }`}
                                                >
                                                    {isPayer ? "-" : "+"}
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
                                <TrendingUp
                                    size={24}
                                    className="text-gray-400"
                                />
                            </div>
                            <p className="text-gray-600 font-medium">
                                No {filter !== "all" ? filter : ""} payments yet
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Successful deal payments will appear here
                            </p>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};
