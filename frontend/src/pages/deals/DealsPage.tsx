import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Plus } from "lucide-react";
import { BadgeVariant } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import {
    DealStatus,
    DealStage,
    User,
    CollaborationRequest,
} from "../../types/index";
import { IAuthProps } from "../../features/auth.slice";
import {
    useCreateDealMutation,
    useGetMyDealsQuery,
    useUpdateDealStatusMutation,
} from "../../services/deal.service";
import { useGetAllUserRequestsQuery } from "../../services/requst.service";

const statuses: Array<{
    value: DealStatus;
    label: string;
    variant: BadgeVariant;
}> = [
    { value: "prospecting", label: "Prospecting", variant: "gray" },
    { value: "due_diligence", label: "Due Diligence", variant: "primary" },
    { value: "term_sheet", label: "Term Sheet", variant: "secondary" },
    { value: "negotiation", label: "Negotiation", variant: "accent" },
    { value: "closed_won", label: "Closed Won", variant: "success" },
    { value: "closed_lost", label: "Closed Lost", variant: "error" },
];

const stages: DealStage[] = [
    "Pre-seed",
    "Seed",
    "Series A",
    "Series B",
    "Series C",
    "Growth",
];

const formatMoney = (n: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(n);

export const DealsPage: React.FC = () => {
    const user = useSelector((state: { auth: IAuthProps }) => state.auth);

    const [search, setSearch] = useState("");

    const [dealDraft, setDealDraft] = useState<{
        partnerId: string;
        title: string;
        amount: string;
        equity: string;
        stage: DealStage;
        status: DealStatus;
    }>({
        partnerId: "",
        title: "",
        amount: "",
        equity: "",
        stage: "Seed",
        status: "prospecting",
    });

    const [statusDrafts, setStatusDrafts] = useState<
        Record<string, DealStatus>
    >({});

    const { data: dealsData } = useGetMyDealsQuery();
    const { data: requestsData } = useGetAllUserRequestsQuery({});
    const [createDeal, { isLoading: creatingDeal }] = useCreateDealMutation();
    const [updateStatus] = useUpdateDealStatusMutation();

    const connections = useMemo(() => {
        if (!user?._id || !requestsData?.requests) return [];

        const map = new Map<string, User>();

        (requestsData.requests as CollaborationRequest[])
            .filter((r) => r.status === "accepted")
            .forEach((r) => {
                const other =
                    r.senderId._id === user._id ? r.receiverId : r.senderId;
                map.set(other._id, other);
            });

        return [...map.values()];
    }, [requestsData?.requests, user?._id]);

    const deals = dealsData?.deals || [];

    useEffect(() => {
        const next: Record<string, DealStatus> = {};
        deals.forEach((d: any) => {
            next[d._id] = d.status;
        });
        setStatusDrafts(next);
    }, [deals]);

    const filteredDeals = deals.filter((d: any) =>
        d.title.toLowerCase().includes(search.toLowerCase()),
    );

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dealDraft.partnerId) return;

        const relationship =
            user.role === "investor"
                ? {
                      investorId: user._id,
                      startupId: dealDraft.partnerId,
                  }
                : {
                      investorId: dealDraft.partnerId,
                      startupId: user._id,
                  };

        await createDeal({
            ...relationship,
            title: dealDraft.title,
            amount: Number(dealDraft.amount),
            equity: Number(dealDraft.equity),
            stage: dealDraft.stage,
            status: dealDraft.status,
            lastActivity: new Date(),
            createdBy: user._id,
        }).unwrap();

        setDealDraft({
            partnerId: "",
            title: "",
            amount: "",
            equity: "",
            stage: "Seed",
            status: "prospecting",
        });
    };

    if (!user?._id) return null;

    return (
        <div className="space-y-6">
            {/* CREATE DEAL */}
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Plus size={20} /> New Deal
                    </h2>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleCreate} className="space-y-5">
                        {/* Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">
                                    Partner
                                </label>
                                <select
                                    title="partnerId"
                                    value={dealDraft.partnerId}
                                    onChange={(e) =>
                                        setDealDraft((p) => ({
                                            ...p,
                                            partnerId: e.target.value,
                                        }))
                                    }
                                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                >
                                    <option value="">Select Partner</option>
                                    {connections.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">
                                    Deal Title
                                </label>
                                <Input
                                    placeholder="Enter deal title"
                                    value={dealDraft.title}
                                    onChange={(e) =>
                                        setDealDraft((p) => ({
                                            ...p,
                                            title: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">
                                    Amount (USD)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="500000"
                                    value={dealDraft.amount}
                                    onChange={(e) =>
                                        setDealDraft((p) => ({
                                            ...p,
                                            amount: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">
                                    Equity (%)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="10"
                                    value={dealDraft.equity}
                                    onChange={(e) =>
                                        setDealDraft((p) => ({
                                            ...p,
                                            equity: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">
                                    Stage
                                </label>
                                <select
                                    title="stage"
                                    value={dealDraft.stage}
                                    onChange={(e) =>
                                        setDealDraft((p) => ({
                                            ...p,
                                            stage: e.target.value as DealStage,
                                        }))
                                    }
                                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                >
                                    {stages.map((stage) => (
                                        <option key={stage} value={stage}>
                                            {stage}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Action */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                isLoading={creatingDeal}
                                className="px-6"
                            >
                                Create Deal
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>

            {/* DEAL LIST */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold">Deal Pipeline</h2>
                        <Input
                            placeholder="Search..."
                            className="w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardBody>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="pb-3">Title</th>
                                    <th className="pb-3">Stage</th>
                                    <th className="pb-3">Value</th>
                                    <th className="pb-3">Equity</th>
                                    <th className="pb-3">Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDeals.map((d: any) => (
                                    <tr key={d._id} className="border-b">
                                        <td className="py-4 font-semibold">
                                            {d.title}
                                        </td>
                                        <td className="py-4">{d.stage}</td>
                                        <td className="py-4 font-bold">
                                            {formatMoney(d.amount)}
                                        </td>
                                        <td className="py-4">{d.equity}%</td>
                                        <td className="py-4">
                                            <select
                                                title="status"
                                                value={
                                                    statusDrafts[d._id] ??
                                                    d.status
                                                }
                                                onChange={(e) =>
                                                    setStatusDrafts((p) => ({
                                                        ...p,
                                                        [d._id]: e.target
                                                            .value as DealStatus,
                                                    }))
                                                }
                                                className="text-xs rounded border-gray-200"
                                            >
                                                {statuses.map((s) => (
                                                    <option
                                                        key={s.value}
                                                        value={s.value}
                                                    >
                                                        {s.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    updateStatus({
                                                        dealId: d._id,
                                                        status: statusDrafts[
                                                            d._id
                                                        ],
                                                    })
                                                }
                                            >
                                                Update
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};
