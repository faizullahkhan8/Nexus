import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    MessageCircle,
    Users,
    Calendar,
    Building2,
    MapPin,
    UserCircle,
    FileText,
    DollarSign,
    Send,
    Eye,
    Download,
} from "lucide-react";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { CollaborationRequest, Document, Entrepreneur } from "../../types";
import { useSelector } from "react-redux";
import { useGetEntrepreneurByIdQuery } from "../../services/auth.service";
import { IAuthProps } from "../../features/auth.slice";
import {
    useCreateRequestMutation,
    useGetAllUserRequestsQuery,
} from "../../services/requst.service";
import toast from "react-hot-toast";
import { useGetDocumentsQuery } from "../../services/document.service";
import DocumentPreviewer from "../../components/ui/PDFViewer";

export const EntrepreneurProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const currentUser = useSelector(
        (state: { auth: IAuthProps }) => state.auth,
    );

    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

    const {
        data: getEntrepreneurData,
        isLoading: entrepreneurLoading,
        isError: entrepreneurError,
    } = useGetEntrepreneurByIdQuery(id || "");

    const [
        createRequest,
        { isLoading: creaetRequestLoading, isError: createRequestError },
    ] = useCreateRequestMutation();

    const {
        data: getAllUserRequestsData,
        isError: getRequestError,
        isLoading: getRequestLoading,
    } = useGetAllUserRequestsQuery({});

    const {
        data: getDocumentsData,
        isLoading: getDocumentsLoading,
        isError: getDocumentsError,
    } = useGetDocumentsQuery();

    const [requestSent, setRequestSent] = useState(false);

    if (entrepreneurLoading)
        return <div className="p-8 text-center">Loading...</div>;

    const entrepreneur = getEntrepreneurData?.entrepreneur as
        | Entrepreneur
        | undefined;

    if (!entrepreneur || entrepreneurError) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">
                    Entrepreneur not found
                </h2>
                <Link to="/dashboard/investor">
                    <Button variant="outline" className="mt-4">
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    const isCurrentUser =
        currentUser?._id === entrepreneur.user?._id.toString();
    const isInvestor = currentUser?.role === "investor";

    const hasRequestedCollaboration =
        requestSent ||
        (isInvestor && id && getAllUserRequestsData?.requests
            ? getAllUserRequestsData.requests.some(
                (req: CollaborationRequest) => {
                    const receiverId = req.receiverId?._id || req.receiverId;
                    return receiverId.toString() === id;
                },
            )
            : false);

    const handleSendRequest = () => {
        if (isInvestor && currentUser?._id && id) {
            createRequest({
                message: `Investor ${currentUser.name} is interested in collaborating.`,
                senderId: currentUser._id,
                receiverId: id,
                type: "DocumentAccess",
            } as any);
            setRequestSent(true);
        }
    };

    const getRoundLabel = (roundNumber: number) => {
        switch (roundNumber) {
            case 1:
                return "Pre-seed";
            case 2:
                return "Seed";
            case 3:
                return "Series A";
            case 4:
                return "Series B";
            case 5:
                return "Series C";
            default:
                return `Series ${String.fromCharCode(64 + roundNumber)}`;
        }
    };

    if (createRequestError || getRequestError || getDocumentsError) {
        return toast.error("somthing went wronge. Please try again later.");
    }

    if (creaetRequestLoading || getRequestLoading || getDocumentsLoading) {
        return toast.loading("Somthing is Loading...");
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <DocumentPreviewer doc={selectedDoc} isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)} />
            {/* Profile header */}
            <Card>
                <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
                    <div className="sm:flex sm:space-x-6">
                        <Avatar
                            src={
                                entrepreneur.avatarUrl ||
                                `https://dummyjson.com/image/150x150/008080/ffffff?text=${entrepreneur.startupName.split(" ")[0][0]}+${entrepreneur.startupName.split(" ")[entrepreneur.startupName.split(" ").length - 1][0]}`
                            }
                            alt={entrepreneur.startupName}
                            size="xl"
                            status={
                                entrepreneur.user?.isOnline
                                    ? "online"
                                    : "offline"
                            }
                            className="max-h-16"
                        />

                        <div className="mt-4 sm:mt-0 text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {entrepreneur.user?.name}
                            </h1>
                            <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                                <Building2 size={16} className="mr-1" />
                                Founder at {entrepreneur.startupName}
                            </p>

                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                                <Badge variant="primary">
                                    {entrepreneur.industry}
                                </Badge>
                                <Badge variant="gray">
                                    <MapPin size={14} className="mr-1" />
                                    {entrepreneur.location}
                                </Badge>
                                <Badge variant="accent">
                                    <Calendar size={14} className="mr-1" />
                                    Founded {entrepreneur.foundedYear}
                                </Badge>
                                <Badge variant="secondary">
                                    <Users size={14} className="mr-1" />
                                    {entrepreneur.team.length} team members
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
                        {!isCurrentUser && (
                            <>
                                <Link to={`/chat/${entrepreneur._id}`}>
                                    <Button
                                        variant="outline"
                                        leftIcon={<MessageCircle size={18} />}
                                    >
                                        Message
                                    </Button>
                                </Link>

                                {isInvestor && (
                                    <Button
                                        leftIcon={<Send size={18} />}
                                        disabled={hasRequestedCollaboration}
                                        onClick={handleSendRequest}
                                    >
                                        {hasRequestedCollaboration
                                            ? "Request Sent"
                                            : "Request Collaboration"}
                                    </Button>
                                )}
                            </>
                        )}

                        {isCurrentUser && (
                            <Link to="/profile/entrepreneur/profile/edit">
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
                            <p className="text-gray-700">
                                {" "}
                                {entrepreneur.bio ? (
                                    entrepreneur.bio
                                ) : (
                                    <span className="text-gray-400 italic text-sm font-mono">
                                        Bio not availible
                                    </span>
                                )}
                            </p>
                        </CardBody>
                    </Card>

                    {/* Startup Description */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-medium text-gray-900">
                                Startup Overview
                            </h2>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                {entrepreneur.startupOverview.length < 1 ? (
                                    <p className="text-gray-500 italic">
                                        No startup overview available
                                    </p>
                                ) : (
                                    entrepreneur.startupOverview.map(
                                        (section, index) => (
                                            <div key={index}>
                                                <h3 className="text-md font-medium text-gray-900">
                                                    {section.heading}
                                                </h3>
                                                <p className="text-gray-700 mt-1">
                                                    {section.paragraph}
                                                </p>
                                            </div>
                                        ),
                                    )
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Team */}
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">
                                Team
                            </h2>
                            <span className="text-sm text-gray-500">
                                {entrepreneur.team.length} members
                            </span>
                        </CardHeader>
                        <CardBody>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {entrepreneur.team.map((t, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center p-3 border border-gray-200 rounded-md"
                                    >
                                        <Avatar
                                            src={
                                                t.avatarUrl
                                                    ? t.avatarUrl
                                                    : `https://dummyjson.com/image/150x150/008080/ffffff?text=${t.name.split(" ")[0][0]}+${t.name.split(" ")[t.name.split(" ").length - 1][0]}`
                                            }
                                            alt={t.name}
                                            size="md"
                                            className="mr-3"
                                        />
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {t.name}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {t.role}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {entrepreneur.team.length > 3 && (
                                    <div className="flex items-center justify-center p-3 border border-dashed border-gray-200 rounded-md">
                                        <p className="text-sm text-gray-500">
                                            + {entrepreneur.team.length - 3}{" "}
                                            more team members
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Sidebar - right side */}
                <div className="space-y-6">
                    {/* Funding Details */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-medium text-gray-900">
                                Funding
                            </h2>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm text-gray-500">
                                        Current Round
                                    </span>
                                    <div className="flex items-center mt-1">
                                        <DollarSign
                                            size={18}
                                            className="text-accent-600 mr-1"
                                        />
                                        <p className="text-lg font-semibold text-gray-900">
                                            {entrepreneur.fundingRound.length >
                                                0
                                                ? entrepreneur.fundingRound.map(
                                                    (round, index) =>
                                                        round.isCurrent && (
                                                            <span key={index}>
                                                                {round.amount.toLocaleString()}{" "}
                                                                -{" "}
                                                                {getRoundLabel(
                                                                    round.round,
                                                                )}
                                                            </span>
                                                        ),
                                                )
                                                : "No funding data available"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-sm text-gray-500">
                                        Valuation
                                    </span>
                                    <p className="text-md font-medium text-gray-900 flex items-center mt-1">
                                        <DollarSign
                                            size={18}
                                            className="text-accent-600 mr-1"
                                        />
                                        {entrepreneur.valuation.min &&
                                            entrepreneur.valuation.max
                                            ? `${entrepreneur.valuation.min.toLocaleString()}M - ${entrepreneur.valuation.max.toLocaleString()}M`
                                            : "No valuation data available"}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-sm text-gray-500">
                                        Previous Funding
                                    </span>
                                    <p className="text-md font-medium text-gray-900">
                                        {entrepreneur.fundingRound.length > 1
                                            ? entrepreneur.fundingRound
                                                .filter(
                                                    (round) =>
                                                        !round.isCurrent,
                                                )
                                                .map((round, index) => (
                                                    <span key={index}>
                                                        $
                                                        {round.amount.toLocaleString()}{" "}
                                                        {getRoundLabel(
                                                            round.round,
                                                        )}{" "}
                                                        (
                                                        {new Date(
                                                            round.date,
                                                        ).getFullYear()}
                                                        )
                                                    </span>
                                                ))
                                            : "No previous funding data available"}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-gray-100">
                                    <span className="text-sm text-gray-500">
                                        Funding Timeline
                                    </span>
                                    <div className="mt-2 space-y-2">
                                        {entrepreneur.fundingRound.length ===
                                            0 && (
                                                <p className="text-gray-500 italic">
                                                    No funding rounds available
                                                </p>
                                            )}
                                        {entrepreneur.fundingRound.map(
                                            (round, index) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-center"
                                                >
                                                    <span
                                                        className={`text-xs font-medium ${round.isCurrent ? "text-green-800" : "text-gray-500"}`}
                                                    >
                                                        {getRoundLabel(
                                                            round.round,
                                                        )}{" "}
                                                        - $
                                                        {round.amount.toLocaleString()}{" "}
                                                        (
                                                        {new Date(
                                                            round.date,
                                                        ).getFullYear()}
                                                        )
                                                    </span>
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                        {round.isCurrent ? (
                                                            <span className="text-green-800">
                                                                Current
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-500">
                                                                Completed
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Documents */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <h2 className="text-lg font-medium text-gray-900">
                                Documents
                            </h2>
                            <Link to={"/documents"}>
                                <Button variant="outline" size="sm">
                                    View All
                                </Button></Link>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-3">
                                {getDocumentsData.documents.length > 0 &&
                                    getDocumentsData.documents
                                        .slice(0, 5)
                                        .map((doc: Document) => (
                                            <div
                                                key={doc._id}
                                                className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="p-2 bg-primary-50 rounded-md mr-3">
                                                    <FileText
                                                        size={18}
                                                        className="text-primary-700"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-medium text-gray-900">
                                                        {doc.originalName.slice(
                                                            0,
                                                            10,
                                                        )}
                                                        ...{doc.format}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        Updated{" "}
                                                        {new Date(
                                                            doc.createdAt,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2 items-center">
                                                    <Button
                                                        onClick={() => setSelectedDoc(doc)}
                                                        variant="outline"
                                                        size="xs"
                                                    >
                                                        <Eye size={14} />
                                                    </Button>
                                                    <Link to={doc.cloudinaryUrl} target="_blank" rel="noopener noreferrer">
                                                        <Button
                                                            variant="outline"
                                                            size="xs"
                                                        >
                                                            <Download size={14} />
                                                        </Button>
                                                    </Link>
                                                </div>

                                            </div>
                                        ))}
                            </div>

                            {!isCurrentUser && isInvestor && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">
                                        Request access to detailed documents and
                                        financials by sending a collaboration
                                        request.
                                    </p>

                                    {!hasRequestedCollaboration ? (
                                        <Button
                                            className="mt-3 w-full"
                                            onClick={handleSendRequest}
                                        >
                                            Request Collaboration
                                        </Button>
                                    ) : (
                                        <Button
                                            className="mt-3 w-full"
                                            disabled
                                        >
                                            Request Sent
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};
