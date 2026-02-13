import React, { useEffect, useMemo, useState } from "react";
import { CalendarClock, DollarSign, Filter, Search, TrendingUp } from "lucide-react";
import { useSelector } from "react-redux";
import { Badge, BadgeVariant } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { IAuthProps } from "../../features/auth.slice";
import { useCreateDealMutation, useGetMyDealsQuery, useUpdateDealStatusMutation } from "../../services/deal.service";
import { useGetMyMeetingsQuery, useScheduleMeetingMutation, useUpdateMeetingStatusMutation } from "../../services/meeting.service";
import { useGetAllUserRequestsQuery } from "../../services/requst.service";
import { CollaborationRequest, DealStage, DealStatus, MeetingStatus, MeetingType, User } from "../../types";

const statuses: Array<{ value: DealStatus; label: string; variant: BadgeVariant }> = [
    { value: "prospecting", label: "Prospecting", variant: "gray" },
    { value: "due_diligence", label: "Due Diligence", variant: "primary" },
    { value: "term_sheet", label: "Term Sheet", variant: "secondary" },
    { value: "negotiation", label: "Negotiation", variant: "accent" },
    { value: "closed_won", label: "Closed Won", variant: "success" },
    { value: "closed_lost", label: "Closed Lost", variant: "error" },
];
const stages: DealStage[] = ["Pre-seed", "Seed", "Series A", "Series B", "Series C", "Growth"];
const meetingTypes: Array<{ value: MeetingType; label: string }> = [
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
    { value: "in_person", label: "In Person" },
];

const formatMoney = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const statusMeta = (s: DealStatus) => statuses.find((x) => x.value === s) || statuses[0];
const meetingVariant = (s: MeetingStatus): BadgeVariant => (s === "completed" ? "success" : s === "cancelled" ? "error" : "primary");

export const DealsPage: React.FC = () => {
    const user = useSelector((state: { auth: IAuthProps }) => state.auth);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<DealStatus[]>([]);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");
    const [dealDraft, setDealDraft] = useState({ counterpartyId: "", title: "", amount: "", equity: "", stage: "Seed" as DealStage });
    const [meetingDraft, setMeetingDraft] = useState({ attendeeId: "", title: "", startTime: "", durationMinutes: "30", meetingType: "video" as MeetingType, relatedDealId: "" });
    const [statusDrafts, setStatusDrafts] = useState<Record<string, DealStatus>>({});

    const { data: requestsData } = useGetAllUserRequestsQuery({});
    const { data: dealsData, isLoading: dealsLoading } = useGetMyDealsQuery();
    const { data: meetingsData, isLoading: meetingsLoading } = useGetMyMeetingsQuery();
    const [createDeal, { isLoading: creatingDeal }] = useCreateDealMutation();
    const [updateDealStatus, { isLoading: savingStatus }] = useUpdateDealStatusMutation();
    const [scheduleMeeting, { isLoading: creatingMeeting }] = useScheduleMeetingMutation();
    const [updateMeetingStatus, { isLoading: savingMeeting }] = useUpdateMeetingStatusMutation();

    const deals = dealsData?.deals || [];
    const meetings = meetingsData?.meetings || [];

    const connections = useMemo(() => {
        if (!user?._id || !requestsData?.requests) return [];
        const map = new Map<string, User>();
        (requestsData.requests as CollaborationRequest[])
            .filter((r) => r.status === "accepted")
            .forEach((r) => {
                const other = r.senderId._id === user._id ? r.receiverId : r.senderId;
                map.set(other._id, other);
            });
        return [...map.values()];
    }, [requestsData?.requests, user?._id]);

    useEffect(() => {
        if (!connections.length) return;
        setDealDraft((p) => ({ ...p, counterpartyId: p.counterpartyId || connections[0]._id }));
        setMeetingDraft((p) => ({ ...p, attendeeId: p.attendeeId || connections[0]._id }));
    }, [connections]);

    useEffect(() => {
        const next: Record<string, DealStatus> = {};
        deals.forEach((d) => (next[d._id] = d.status));
        setStatusDrafts(next);
    }, [deals]);

    const filteredDeals = useMemo(() => {
        return deals.filter((d) => {
            const other = d.investorId._id === user._id ? d.startupId : d.investorId;
            const q = search.toLowerCase();
            const matchText = !q || d.title.toLowerCase().includes(q) || other.name.toLowerCase().includes(q) || d.stage.toLowerCase().includes(q);
            const matchStatus = filters.length === 0 || filters.includes(d.status);
            return matchText && matchStatus;
        });
    }, [deals, filters, search, user._id]);

    const total = deals.reduce((sum, d) => sum + d.amount, 0);
    const active = deals.filter((d) => !["closed_won", "closed_lost"].includes(d.status)).length;
    const won = deals.filter((d) => d.status === "closed_won").length;
    const upcoming = meetings.filter((m) => m.status === "scheduled" && new Date(m.startTime).getTime() >= Date.now()).length;

    const toggleFilter = (s: DealStatus) => setFilters((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

    const createDealSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErr(""); setMsg("");
        const amount = Number(dealDraft.amount), equity = Number(dealDraft.equity);
        if (!dealDraft.counterpartyId || !dealDraft.title.trim() || Number.isNaN(amount) || Number.isNaN(equity)) { setErr("Fill deal title, counterparty, amount and equity."); return; }
        try {
            await createDeal({ counterpartyId: dealDraft.counterpartyId, title: dealDraft.title.trim(), amount, equity, stage: dealDraft.stage }).unwrap();
            setMsg("Deal created.");
            setDealDraft((p) => ({ ...p, title: "", amount: "", equity: "" }));
        } catch (e2) {
            const apiErr = e2 as { data?: { message?: string } };
            setErr(apiErr?.data?.message || "Could not create deal.");
        }
    };

    const scheduleMeetingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErr(""); setMsg("");
        if (!meetingDraft.attendeeId || !meetingDraft.title.trim() || !meetingDraft.startTime) { setErr("Fill attendee, title and start time."); return; }
        try {
            await scheduleMeeting({ attendeeId: meetingDraft.attendeeId, title: meetingDraft.title.trim(), startTime: new Date(meetingDraft.startTime).toISOString(), durationMinutes: Number(meetingDraft.durationMinutes) || 30, meetingType: meetingDraft.meetingType, relatedDealId: meetingDraft.relatedDealId || undefined }).unwrap();
            setMsg("Meeting scheduled.");
            setMeetingDraft((p) => ({ ...p, title: "", startTime: "", durationMinutes: "30", relatedDealId: "" }));
        } catch (e2) {
            const apiErr = e2 as { data?: { message?: string } };
            setErr(apiErr?.data?.message || "Could not schedule meeting.");
        }
    };

    const saveDealStatus = async (dealId: string) => {
        const status = statusDrafts[dealId];
        if (!status) return;
        setErr(""); setMsg("");
        try { await updateDealStatus({ dealId, status }).unwrap(); setMsg("Deal status updated."); }
        catch (e2) { const apiErr = e2 as { data?: { message?: string } }; setErr(apiErr?.data?.message || "Could not update deal status."); }
    };

    const saveMeetingStatus = async (meetingId: string, status: MeetingStatus) => {
        setErr(""); setMsg("");
        try { await updateMeetingStatus({ meetingId, status }).unwrap(); setMsg("Meeting status updated."); }
        catch (e2) { const apiErr = e2 as { data?: { message?: string } }; setErr(apiErr?.data?.message || "Could not update meeting status."); }
    };

    if (!user?._id) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            <div><h1 className="text-2xl font-bold text-gray-900">Deals and Meetings</h1><p className="text-gray-600">Track deal flow and schedule meetings with your connections.</p></div>
            {err && <div className="rounded border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700">{err}</div>}
            {msg && <div className="rounded border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700">{msg}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card><CardHeader><h2 className="text-lg font-medium text-gray-900">Create Deal</h2></CardHeader><CardBody><form className="space-y-3" onSubmit={createDealSubmit}><select value={dealDraft.counterpartyId} onChange={(e) => setDealDraft((p) => ({ ...p, counterpartyId: e.target.value }))} className="w-full rounded border border-gray-300 px-3 py-2 text-sm">{connections.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}</select><Input placeholder="Deal title" value={dealDraft.title} onChange={(e) => setDealDraft((p) => ({ ...p, title: e.target.value }))} fullWidth /><div className="grid grid-cols-3 gap-2"><Input type="number" placeholder="Amount" value={dealDraft.amount} onChange={(e) => setDealDraft((p) => ({ ...p, amount: e.target.value }))} fullWidth /><Input type="number" placeholder="Equity %" value={dealDraft.equity} onChange={(e) => setDealDraft((p) => ({ ...p, equity: e.target.value }))} fullWidth /><select value={dealDraft.stage} onChange={(e) => setDealDraft((p) => ({ ...p, stage: e.target.value as DealStage }))} className="rounded border border-gray-300 px-3 py-2 text-sm">{stages.map((s) => <option key={s} value={s}>{s}</option>)}</select></div><Button type="submit" fullWidth isLoading={creatingDeal} disabled={connections.length === 0}>Create Deal</Button></form></CardBody></Card>
                <Card><CardHeader><h2 className="text-lg font-medium text-gray-900">Schedule Meeting</h2></CardHeader><CardBody><form className="space-y-3" onSubmit={scheduleMeetingSubmit}><select value={meetingDraft.attendeeId} onChange={(e) => setMeetingDraft((p) => ({ ...p, attendeeId: e.target.value }))} className="w-full rounded border border-gray-300 px-3 py-2 text-sm">{connections.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}</select><Input placeholder="Meeting title" value={meetingDraft.title} onChange={(e) => setMeetingDraft((p) => ({ ...p, title: e.target.value }))} fullWidth /><div className="grid grid-cols-2 gap-2"><Input type="datetime-local" value={meetingDraft.startTime} onChange={(e) => setMeetingDraft((p) => ({ ...p, startTime: e.target.value }))} fullWidth /><Input type="number" min={15} value={meetingDraft.durationMinutes} onChange={(e) => setMeetingDraft((p) => ({ ...p, durationMinutes: e.target.value }))} fullWidth /></div><div className="grid grid-cols-2 gap-2"><select value={meetingDraft.meetingType} onChange={(e) => setMeetingDraft((p) => ({ ...p, meetingType: e.target.value as MeetingType }))} className="rounded border border-gray-300 px-3 py-2 text-sm">{meetingTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select><select value={meetingDraft.relatedDealId} onChange={(e) => setMeetingDraft((p) => ({ ...p, relatedDealId: e.target.value }))} className="rounded border border-gray-300 px-3 py-2 text-sm"><option value="">No related deal</option>{deals.map((d) => <option key={d._id} value={d._id}>{d.title}</option>)}</select></div><Button type="submit" fullWidth isLoading={creatingMeeting} disabled={connections.length === 0}>Schedule Meeting</Button></form></CardBody></Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card><CardBody><div className="flex items-center"><div className="p-2 bg-primary-100 rounded mr-3"><DollarSign size={18} className="text-primary-600" /></div><div><p className="text-xs text-gray-600">Pipeline Value</p><p className="text-lg font-semibold">{formatMoney(total)}</p></div></div></CardBody></Card>
                <Card><CardBody><div className="flex items-center"><div className="p-2 bg-secondary-100 rounded mr-3"><TrendingUp size={18} className="text-secondary-600" /></div><div><p className="text-xs text-gray-600">Active Deals</p><p className="text-lg font-semibold">{active}</p></div></div></CardBody></Card>
                <Card><CardBody><div className="flex items-center"><div className="p-2 bg-success-100 rounded mr-3"><Filter size={18} className="text-success-600" /></div><div><p className="text-xs text-gray-600">Closed Won</p><p className="text-lg font-semibold">{won}</p></div></div></CardBody></Card>
                <Card><CardBody><div className="flex items-center"><div className="p-2 bg-accent-100 rounded mr-3"><CalendarClock size={18} className="text-accent-600" /></div><div><p className="text-xs text-gray-600">Upcoming Meetings</p><p className="text-lg font-semibold">{upcoming}</p></div></div></CardBody></Card>
            </div>
            <Card><CardHeader><h2 className="text-lg font-medium text-gray-900">Deal Pipeline</h2></CardHeader><CardBody><div className="flex flex-col md:flex-row gap-3 mb-4"><Input placeholder="Search deals" value={search} onChange={(e) => setSearch(e.target.value)} startAdornment={<Search size={16} />} fullWidth /><div className="flex flex-wrap gap-2">{statuses.map((s) => <Badge key={s.value} variant={filters.includes(s.value) ? s.variant : "gray"} className="cursor-pointer" onClick={() => toggleFilter(s.value)}>{s.label}</Badge>)}</div></div>{dealsLoading ? <p className="text-sm text-gray-600">Loading deals...</p> : filteredDeals.length === 0 ? <p className="text-sm text-gray-600">No deals found.</p> : <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-200"><th className="text-left text-xs text-gray-500 uppercase px-3 py-2">Counterparty</th><th className="text-left text-xs text-gray-500 uppercase px-3 py-2">Title</th><th className="text-left text-xs text-gray-500 uppercase px-3 py-2">Amount</th><th className="text-left text-xs text-gray-500 uppercase px-3 py-2">Status</th><th className="text-right text-xs text-gray-500 uppercase px-3 py-2">Action</th></tr></thead><tbody className="divide-y divide-gray-200">{filteredDeals.map((d) => {const other = d.investorId._id === user._id ? d.startupId : d.investorId;const draft = statusDrafts[d._id] || d.status;const sm = statusMeta(draft);return <tr key={d._id}><td className="px-3 py-2 text-sm">{other.name}</td><td className="px-3 py-2 text-sm">{d.title}</td><td className="px-3 py-2 text-sm">{formatMoney(d.amount)}</td><td className="px-3 py-2"><div className="space-y-1"><Badge variant={sm.variant}>{sm.label}</Badge><select value={draft} onChange={(e) => setStatusDrafts((p) => ({ ...p, [d._id]: e.target.value as DealStatus }))} className="w-full rounded border border-gray-300 px-2 py-1 text-xs">{statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div></td><td className="px-3 py-2 text-right"><Button size="sm" variant="outline" isLoading={savingStatus} onClick={() => saveDealStatus(d._id)}>Save</Button></td></tr>;})}</tbody></table></div>}</CardBody></Card>
            <Card><CardHeader><h2 className="text-lg font-medium text-gray-900">Scheduled Meetings</h2></CardHeader><CardBody>{meetingsLoading ? <p className="text-sm text-gray-600">Loading meetings...</p> : meetings.length === 0 ? <p className="text-sm text-gray-600">No meetings yet.</p> : <div className="space-y-3">{meetings.map((m) => {const other = m.scheduledBy._id === user._id ? m.attendeeId : m.scheduledBy;return <div key={m._id} className="rounded border border-gray-200 p-3"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2"><div><p className="font-medium text-gray-900">{m.title}</p><p className="text-sm text-gray-600">With {other.name} • {new Date(m.startTime).toLocaleString()} • {m.durationMinutes} min</p></div><div className="flex items-center gap-2"><Badge variant={meetingVariant(m.status)}>{m.status}</Badge>{m.status === "scheduled" && <><Button size="sm" variant="success" isLoading={savingMeeting} onClick={() => saveMeetingStatus(m._id, "completed")}>Complete</Button><Button size="sm" variant="error" isLoading={savingMeeting} onClick={() => saveMeetingStatus(m._id, "cancelled")}>Cancel</Button></>}</div></div></div>;})}</div>}</CardBody></Card>
        </div>
    );
};

