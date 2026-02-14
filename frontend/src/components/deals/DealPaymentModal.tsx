import React, { useState } from "react";
import { CreditCard, AlertCircle, Loader } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useCreateDealPaymentMutation } from "../../services/payment.service";
import { useSelector } from "react-redux";
import { IAuthProps } from "../../features/auth.slice";

interface DealPaymentModalProps {
    open: boolean;
    onClose: () => void;
    deal: any;
}

export const DealPaymentModal: React.FC<DealPaymentModalProps> = ({
    open,
    onClose,
    deal,
}) => {
    const user = useSelector((state: { auth: IAuthProps }) => state.auth);
    const [amount, setAmount] = useState<string>("0");
    const [currency, setCurrency] = useState<string>("usd");
    const [error, setError] = useState<string>("");

    const [createDealPayment, { isLoading }] = useCreateDealPaymentMutation();

    if (!open) return null;

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!amount || Number(amount) <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        if (!deal?._id) {
            setError("Deal information is missing");
            return;
        }

        try {
            const successUrl = `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`;
            const result = await createDealPayment({
                dealId: deal._id,
                amount: Number(amount),
                currency,
                success_url: successUrl,
            }).unwrap();

            if (result.url) {
                // Redirect to Stripe checkout
                window.location.href = result.url;
            }
        } catch (err: any) {
            setError(err?.data?.message || "Failed to create payment");
        }
    };

    const otherPartyName =
        deal.investorId?._id === user._id
            ? deal.startupId?.name
            : deal.investorId?.name;

    const otherPartyRole =
        deal.investorId?._id === user._id ? "Investor" : "Startup";

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary-100 rounded-lg">
                        <CreditCard size={20} className="text-primary-700" />
                    </div>
                    <h2 className="text-lg font-bold">Make Payment for Deal</h2>
                </div>

                <Card className="mb-4 bg-gray-50">
                    <CardBody className="text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Deal Title:</span>
                            <span className="font-medium">{deal.title}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-medium">
                                ${deal.amount?.toLocaleString() || "0"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Equity:</span>
                            <Badge variant="primary">{deal.equity}%</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <Badge
                                variant={
                                    deal.status === "closed_won"
                                        ? "success"
                                        : "gray"
                                }
                            >
                                {deal.status?.replace(/_/g, " ")}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Other Party:</span>
                            <span className="font-medium">
                                {otherPartyName} ({otherPartyRole})
                            </span>
                        </div>
                    </CardBody>
                </Card>

                {error && (
                    <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg flex gap-2">
                        <AlertCircle
                            size={16}
                            className="text-error-600 mt-0.5 flex-shrink-0"
                        />
                        <p className="text-sm text-error-600">{error}</p>
                    </div>
                )}

                <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Amount
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                            <select
                                title="currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            >
                                <option value="usd">USD</option>
                                <option value="eur">EUR</option>
                                <option value="gbp">GBP</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                        <p>
                            💳 You will be redirected to Stripe to complete your
                            payment securely.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader
                                        size={16}
                                        className="animate-spin"
                                    />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard size={16} />
                                    Pay Now
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
