export type UserRole = "entrepreneur" | "investor";

export interface User {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl: string;
    isOnline?: boolean;
    createdAt: string;
}

export interface IfundingRound {
    round: number;
    amount: number;
    isCurrent: boolean;
    date: string;
}

export interface StartupOverview {
    heading: string;
    paragraph: string;
}

export interface ITeamMember {
    name: string;
    avatarUrl?: string;
    role: string;
}

export interface Entrepreneur extends User {
    startupName: string;
    bio: string;
    pitchSummary: string;
    fundingRound: IfundingRound[];
    valuation: {
        min: number;
        max: number;
    };
    startupOverview: StartupOverview[];
    industry: string;
    location: string;
    foundedYear: number;
    team: ITeamMember[];
    user?: User;
}

export interface IPortfolioCompanies {
    name: string;
    date: string;
    amountInvested: number;
}

export interface IInvestmentInterests {
    interest: string;
    percentage: number;
}

export interface Investor extends User {
    investmentInterests: IInvestmentInterests[];
    investmentStages: string[];
    portfolioCompanies: IPortfolioCompanies[];
    investmentCriteria: string[];
    location: string;
    investmentRange: {
        minAmount: number;
        maxAmount: number;
    };
    bio: string;
    user: User;
}

export interface Message {
    id?: string;
    _id?: string;
    senderId: string | User;
    receiverId: string | User;
    content: string;
    timestamp?: string;
    createdAt?: string;
    isRead: boolean;
}

export interface ChatConversation {
    id: string;
    participants: string[];
    lastMessage?: Message;
    updatedAt: string;
}

export interface CollaborationRequest {
    _id: string;
    senderId: User;
    receiverId: User;
    type?: "Connection" | "DocumentAccess" | "Meeting";
    documentId?: string;
    status?: "pending" | "accepted" | "rejected";
    createdAt?: Date;
    message: string;
}

export interface Notification {
    _id: string;
    sender: User;
    recipient: string;
    type:
        | "CONNECTION_REQUEST"
        | "REQUEST_ACCEPTED"
        | "NEW_MESSAGE"
        | "DOCUMENT_SHARED"
        | "MEETING_SCHEDULED"
        | "INVESTMENT_RECEIVED";
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: Date;
}

export interface Document {
    _id: string;
    originalName: string;
    fileName: string;
    format: "pdf" | "doc" | "docx";
    mimeType: string;
    fileSize: number;
    cloudinaryUrl: string;
    cloudinaryPublicId: string;
    uploadedBy: User;
    visibility: "private" | "public";
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthContextType {
    user: User | null;
}
