import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardBody } from "../../components/ui/Card";
import { useSelector } from "react-redux";
import { IAuthProps } from "../../features/auth.slice";
import { useVerifyPaymentQuery } from "../../services/payment.service";

export const PaymentSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const user = useSelector((state: { auth: IAuthProps }) => state.auth);

    const sessionId = searchParams.get("session_id");

    const { data, isLoading, isError } = useVerifyPaymentQuery(
        sessionId as string,
        {
            skip: !sessionId,
        },
    );

    // 🔒 Not authenticated
    if (!user?._id) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardBody className="text-center py-8">
                        <AlertCircle
                            size={48}
                            className="text-error-600 mx-auto mb-4"
                        />
                        <h2 className="text-lg font-bold mb-2 text-gray-900">
                            Not Authenticated
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Please log in to view your payment status.
                        </p>
                        <Button onClick={() => navigate("/auth/login")}>
                            Go to Login
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // ⏳ Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardBody className="text-center py-12">
                        <Loader
                            size={48}
                            className="text-primary-600 mx-auto mb-4 animate-spin"
                        />
                        <h2 className="text-lg font-bold mb-2 text-gray-900">
                            Verifying Payment
                        </h2>
                        <p className="text-gray-600">
                            Please wait while we verify your payment...
                        </p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // ❌ No session ID
    if (!sessionId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardBody className="text-center py-8">
                        <AlertCircle
                            size={48}
                            className="text-error-600 mx-auto mb-4"
                        />
                        <h2 className="text-lg font-bold mb-2 text-gray-900">
                            Invalid Request
                        </h2>
                        <p className="text-gray-600 mb-6">
                            No session ID found.
                        </p>
                        <Button onClick={() => navigate("/deals")}>
                            Back to Deals
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // ❌ API error
    if (isError || !data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardBody className="text-center py-8">
                        <AlertCircle
                            size={48}
                            className="text-error-600 mx-auto mb-4"
                        />
                        <h2 className="text-lg font-bold mb-2 text-gray-900">
                            Verification Failed
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Unable to verify payment. Please contact support.
                        </p>
                        <Button onClick={() => navigate("/payments")}>
                            View Payments
                        </Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // ✅ Main Result
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Card className="w-full max-w-md">
                <CardBody className="text-center py-12">
                    {data.success ? (
                        <>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100 mb-6">
                                <CheckCircle
                                    size={32}
                                    className="text-success-600"
                                />
                            </div>
                            <h2 className="text-2xl font-bold mb-2 text-gray-900">
                                Payment Successful!
                            </h2>
                            <p className="text-gray-600 mb-2">{data.message}</p>
                            {data.paymentId && (
                                <p className="text-sm text-gray-500 mb-6 break-all">
                                    Payment ID: {data.paymentId}
                                </p>
                            )}
                            <div className="space-y-3">
                                <Button
                                    onClick={() => navigate("/payments")}
                                    className="w-full"
                                >
                                    View All Payments
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/deals")}
                                    className="w-full"
                                >
                                    Back to Deals
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error-100 mb-6">
                                <AlertCircle
                                    size={32}
                                    className="text-error-600"
                                />
                            </div>
                            <h2 className="text-2xl font-bold mb-2 text-gray-900">
                                Payment Failed
                            </h2>
                            <p className="text-gray-600 mb-6">{data.message}</p>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => navigate("/deals")}
                                    className="w-full"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/payments")}
                                    className="w-full"
                                >
                                    View Payments
                                </Button>
                            </div>
                        </>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};
