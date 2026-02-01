import React from "react";
import { useParams, Link } from "react-router-dom";
import {
    MessageCircle,
    Building2,
    MapPin,
    UserCircle,
    BarChart3,
    Briefcase,
} from "lucide-react";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useSelector } from "react-redux";
import { IAuthProps } from "../../features/auth.slice";
import { useGetInvestorByIdQuery } from "../../services/auth.service";
import { Investor } from "../../types";

export const InvestorProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const currentUser = useSelector(
        (state: { auth: IAuthProps }) => state.auth,
    );

    // Fetch investor data
    const { data, isLoading, isError } = useGetInvestorByIdQuery(id!);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) {
        return <div>Error loading investor profile.</div>;
    }

    const investor: Investor = data.investor;

    if (!investor || investor.user.role !== "investor") {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">
                    Investor not found
                </h2>
                <p className="text-gray-600 mt-2">
                    The investor profile you're looking for doesn't exist or has
                    been removed.
                </p>
                <Link to="/dashboard/entrepreneur">
                    <Button variant="outline" className="mt-4">
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    const isCurrentUser = currentUser?._id === investor.user._id.toString();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Profile header */}
            <Card>
                <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
                    <div className="sm:flex sm:space-x-6">
                        <Avatar
                            src={
                                investor.user.avatarUrl ||
                                `https://dummyjson.com/image/150x150/008080/ffffff?text=${investor.user.name.split(" ")[0][0]}+${investor.user.name.split(" ")[investor.user.name.split(" ").length - 1][0]}`
                            }
                            alt={investor.user.name}
                            size="xl"
                            status={
                                investor.user.isOnline ? "online" : "offline"
                            }
                            className="max-h-16"
                        />

                        <div className="mt-4 sm:mt-0 text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {investor.user.name}
                            </h1>
                            <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                                <Building2 size={16} className="mr-1" />
                                Investor • {
                                    investor.portfolioCompanies.length
                                }{" "}
                                investments
                            </p>

                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                                <Badge variant="primary">
                                    <MapPin size={14} className="mr-1" />
                                    {investor.location || "Location N/A"}
                                </Badge>
                                {investor.investmentStages?.length > 0 &&
                                    investor.investmentStages.map(
                                        (stage, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                size="sm"
                                            >
                                                {stage}
                                            </Badge>
                                        ),
                                    )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
                        {!isCurrentUser && (
                            <Link to={`/chat/${investor._id}`}>
                                <Button leftIcon={<MessageCircle size={18} />}>
                                    Message
                                </Button>
                            </Link>
                        )}

                        {isCurrentUser && (
                            <Link to="/profile/investor/profile/edit">
                                <Button
                                    variant="outline"
                                    leftIcon={<UserCircle size={18} />}
                                >
                                    Edit Profile
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardBody>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content - left side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-medium text-gray-900">
                                About
                            </h2>
                        </CardHeader>
                        <CardBody>
                            <p className="text-gray-700">{investor?.bio}</p>
                        </CardBody>
                    </Card>

                    {/* Investment Interests */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-medium text-gray-900">
                                Investment Interests
                            </h2>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-md font-medium text-gray-900">
                                        Industries
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {investor.investmentInterests.map(
                                            (interest, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="primary"
                                                    size="md"
                                                >
                                                    {interest.interest}
                                                </Badge>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-md font-medium text-gray-900">
                                        Investment Stages
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {investor.investmentStages?.length >
                                            0 &&
                                            investor.investmentStages.map(
                                                (stage, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        size="md"
                                                    >
                                                        {stage}
                                                    </Badge>
                                                ),
                                            )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-md font-medium text-gray-900">
                                        Investment Criteria
                                    </h3>
                                    <ul className="mt-2 space-y-2 text-gray-700">
                                        {investor.investmentCriteria?.length >
                                        0 ? (
                                            investor.investmentCriteria.map(
                                                (criterion, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-start"
                                                    >
                                                        <span className="inline-block w-2 h-2 bg-primary-600 rounded-full mt-1.5 mr-2"></span>
                                                        {criterion}
                                                    </li>
                                                ),
                                            )
                                        ) : (
                                            <li className="text-sm text-gray-500">
                                                No investment criteria set
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Portfolio Companies */}
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">
                                Portfolio Companies
                            </h2>
                            <span className="text-sm text-gray-500">
                                {investor.portfolioCompanies.length} companies
                            </span>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {investor.portfolioCompanies.map(
                                    (company, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center p-3 border border-gray-200 rounded-md"
                                        >
                                            <div className="p-3 bg-primary-50 rounded-md mr-3">
                                                <Briefcase
                                                    size={18}
                                                    className="text-primary-700"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    {company.name}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    Invested $
                                                    {company.amountInvested.toLocaleString()}{" "}
                                                    in {company.date}
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Sidebar - right side */}
                <div className="space-y-6">
                    {/* Investment Details */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-medium text-gray-900">
                                Investment Details
                            </h2>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Investment Range
                                    </span>
                                    <p className="text-lg font-semibold text-gray-900">
                                        $
                                        {investor.investmentRange.minAmount.toLocaleString()}{" "}
                                        - $
                                        {investor.investmentRange.maxAmount.toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-sm text-gray-500">
                                        Total Investments
                                    </span>
                                    <p className="text-md font-medium text-gray-900">
                                        {investor.portfolioCompanies.length}{" "}
                                        companies
                                    </p>
                                </div>

                                <div>
                                    <span className="text-sm text-gray-500">
                                        Typical Investment Timeline
                                    </span>
                                    <p className="text-md font-medium text-gray-900">
                                        3-5 years
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-gray-100">
                                    <span className="text-sm text-gray-500">
                                        Investment Focus
                                    </span>
                                    <div className="mt-2 space-y-2">
                                        {investor.investmentInterests.length >
                                            0 &&
                                            investor.investmentInterests.map(
                                                (interest, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex justify-between items-center"
                                                    >
                                                        <span className="text-xs font-medium">
                                                            {interest.interest}
                                                        </span>
                                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`bg-primary-600 h-2 rounded-full`}
                                                                style={{
                                                                    width: `${interest.percentage}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Stats */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-medium text-gray-900">
                                Investment Stats
                            </h2>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-3">
                                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">
                                                Successful Exits
                                            </h3>
                                            <p className="text-xl font-semibold text-primary-700 mt-1">
                                                4
                                            </p>
                                        </div>
                                        <BarChart3
                                            size={24}
                                            className="text-primary-600"
                                        />
                                    </div>
                                </div>

                                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">
                                                Avg. ROI
                                            </h3>
                                            <p className="text-xl font-semibold text-primary-700 mt-1">
                                                3.2x
                                            </p>
                                        </div>
                                        <BarChart3
                                            size={24}
                                            className="text-primary-600"
                                        />
                                    </div>
                                </div>

                                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">
                                                Active Investments
                                            </h3>
                                            <p className="text-xl font-semibold text-primary-700 mt-1">
                                                {
                                                    investor.portfolioCompanies
                                                        .length
                                                }
                                            </p>
                                        </div>
                                        <BarChart3
                                            size={24}
                                            className="text-primary-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};
