import { useState, useEffect } from "react";
import {
    PlusCircle,
    Trash2,
    Save,
    DollarSign,
    Quote,
    Users,
    TrendingUp,
    MapPin,
    Calendar,
    Building2,
    Sparkles,
} from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useSelector } from "react-redux";
import {
    useGetEntrepreneurByIdQuery,
    useUpdateEntrepreneurMutation,
} from "../../services/auth.service";
import { IfundingRound, ITeamMember, StartupOverview } from "../../types";
import toast from "react-hot-toast";

const EntrepreneurEditProfile = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { _id: currentUserId } = useSelector((state: any) => state.auth);

    const { data, isLoading, refetch } = useGetEntrepreneurByIdQuery(
        currentUserId,
        {
            skip: !currentUserId,
        },
    );

    const [updateEntrepreneur, { isLoading: isUpdating }] =
        useUpdateEntrepreneurMutation();

    const [formData, setFormData] = useState({
        startupName: "",
        industry: "SaaS",
        pitchSummary: "",
        bio: "",
        location: "",
        foundedYear: new Date().getFullYear(),
        valuation: { min: 0, max: 0 },
        fundingRound: [] as IfundingRound[],
        startupOverview: [] as StartupOverview[],
        team: [] as ITeamMember[],
    });

    useEffect(() => {
        if (!data) return;
        const entrepreneur = data.entrepreneur;
        setFormData({
            startupName: entrepreneur.startupName ?? "",
            industry: entrepreneur.industry ?? "SaaS",
            pitchSummary: entrepreneur.pitchSummary ?? "",
            bio: entrepreneur.bio ?? "",
            location: entrepreneur.location ?? "",
            foundedYear: entrepreneur.foundedYear ?? new Date().getFullYear(),
            valuation: {
                min: entrepreneur.valuation?.min ?? 0,
                max: entrepreneur.valuation?.max ?? 0,
            },
            fundingRound: entrepreneur.fundingRound ?? [],
            startupOverview: entrepreneur.startupOverview ?? [],
            team: entrepreneur.team ?? [],
        });
    }, [data]);

    const addOverviewSection = () => {
        setFormData((p) => ({
            ...p,
            startupOverview: [
                ...p.startupOverview,
                { heading: "", paragraph: "" },
            ],
        }));
    };

    const removeOverviewSection = (index: number) => {
        setFormData((p) => ({
            ...p,
            startupOverview: p.startupOverview.filter((_, i) => i !== index),
        }));
    };

    const addFundingRound = () => {
        setFormData((p) => ({
            ...p,
            fundingRound: [
                ...p.fundingRound,
                {
                    round: p.fundingRound.length + 1,
                    amount: 0,
                    isCurrent: false,
                    date: new Date().toISOString().split("T")[0],
                },
            ],
        }));
    };

    const removeFundingRound = (index: number) => {
        setFormData((p) => ({
            ...p,
            fundingRound: p.fundingRound.filter((_, i) => i !== index),
        }));
    };

    const addTeamMember = () => {
        setFormData((p) => ({
            ...p,
            team: [...p.team, { name: "", role: "", avatarUrl: "" }],
        }));
    };

    const removeTeamMember = (index: number) => {
        setFormData((p) => ({
            ...p,
            team: p.team.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData,
            fundingRound: formData.fundingRound.map((r) => ({
                ...r,
                date: new Date(r.date),
            })),
        };

        try {
            await updateEntrepreneur(payload).unwrap();
            toast.success("Profile updated successfully!");
            // invalidate or refetch queries if needed
            refetch();
        } catch (err) {
            console.error(err);
            toast.error("Update failed. Please try again.");
        }
    };

    const industries = [
        "SaaS",
        "FinTech",
        "HealthTech",
        "EdTech",
        "E-commerce",
        "AI/ML",
        "Blockchain",
        "CleanTech",
        "BioTech",
        "Consumer",
        "Enterprise",
        "Other",
    ];

    if (isLoading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-600 font-medium">
                        Loading your profile...
                    </p>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
            <div className="profile-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-5xl font-bold text-slate-900 mb-3">
                                Edit Your{" "}
                                <span className="gradient-text">Profile</span>
                            </h1>
                            <p className="text-lg text-slate-600 max-w-2xl">
                                Showcase your startup to potential investors.
                                Make every detail count.
                            </p>
                        </div>
                        <div className="stat-badge px-6 py-3 rounded-xl border border-slate-200">
                            <p className="text-xs text-slate-500 mb-1">
                                Profile Completion
                            </p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {Math.round(
                                    ((formData.startupName ? 1 : 0) +
                                        (formData.pitchSummary ? 1 : 0) +
                                        (formData.location ? 1 : 0) +
                                        (formData.startupOverview.length > 0
                                            ? 1
                                            : 0) +
                                        (formData.team.length > 0 ? 1 : 0) +
                                        (formData.fundingRound.length > 0
                                            ? 1
                                            : 0)) *
                                        16.67,
                                )}
                                %
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Core Identity Section */}
                    <section className="section-card bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Core Identity
                                </h2>
                                <p className="text-sm text-slate-600">
                                    The foundation of your startup story
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Startup Name *
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Enter your startup name"
                                    value={formData.startupName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            startupName: e.target.value,
                                        })
                                    }
                                    className="input-focus w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="industry"
                                    className="block text-sm font-semibold text-slate-700 mb-2"
                                >
                                    Industry *
                                </label>
                                <select
                                    id="industry"
                                    value={formData.industry}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            industry: e.target.value,
                                        })
                                    }
                                    className="input-focus w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900"
                                    required
                                >
                                    {industries.map((ind) => (
                                        <option key={ind} value={ind}>
                                            {ind}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Location *
                                </label>
                                <Input
                                    type="text"
                                    placeholder="e.g., San Francisco, CA"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            location: e.target.value,
                                        })
                                    }
                                    className="input-focus w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Founded Year *
                                </label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 2024"
                                    value={formData.foundedYear}
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            foundedYear: Number(e.target.value),
                                        })
                                    }
                                    className="input-focus w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Pitch Summary *
                                </label>
                                <textarea
                                    placeholder="A compelling one-liner that captures what you do and why it matters..."
                                    value={formData.pitchSummary}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            pitchSummary: e.target.value,
                                        })
                                    }
                                    rows={3}
                                    className="input-focus w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900 placeholder:text-slate-400 resize-none"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Bio / Company Description
                                </label>
                                <textarea
                                    placeholder="Tell your story. What problem are you solving? What's your vision?"
                                    value={formData.bio}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            bio: e.target.value,
                                        })
                                    }
                                    rows={5}
                                    className="input-focus w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900 placeholder:text-slate-400 resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Valuation Section */}
                    <section className="section-card bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Valuation Range
                                </h2>
                                <p className="text-sm text-slate-600">
                                    Your current valuation estimate
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Minimum Valuation ($)
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="number"
                                        placeholder="1000000"
                                        value={formData.valuation.min || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                valuation: {
                                                    ...formData.valuation,
                                                    min: +e.target.value,
                                                },
                                            })
                                        }
                                        className="input-focus w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Maximum Valuation ($)
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="number"
                                        placeholder="5000000"
                                        value={formData.valuation.max || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                valuation: {
                                                    ...formData.valuation,
                                                    max: +e.target.value,
                                                },
                                            })
                                        }
                                        className="input-focus w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {formData.valuation.min > 0 &&
                            formData.valuation.max > 0 && (
                                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <p className="text-sm text-emerald-800 font-medium">
                                        Valuation Range:{" "}
                                        <span className="font-bold">
                                            $
                                            {formData.valuation.min.toLocaleString()}{" "}
                                            - $
                                            {formData.valuation.max.toLocaleString()}
                                        </span>
                                    </p>
                                </div>
                            )}
                    </section>

                    {/* Startup Overview Section */}
                    <section className="section-card bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Quote className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Startup Overview
                                    </h2>
                                    <p className="text-sm text-slate-600">
                                        Tell your story in sections
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={addOverviewSection}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium rounded-lg transition-colors"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Add Section
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {formData.startupOverview.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                                    <Quote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-4">
                                        No overview sections yet
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={addOverviewSection}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                        Create First Section
                                    </Button>
                                </div>
                            ) : (
                                formData.startupOverview.map((section, i) => (
                                    <div
                                        key={i}
                                        className="item-card p-6 border-2 border-slate-200 rounded-xl hover:border-purple-300 transition-colors duration-75 delay-75"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                                Section {i + 1}
                                            </span>
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    removeOverviewSection(i)
                                                }
                                                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Section Heading
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="e.g., Our Mission, The Problem, Our Solution"
                                                    value={section.heading}
                                                    onChange={(e) => {
                                                        const updated = [
                                                            ...formData.startupOverview,
                                                        ];
                                                        updated[i].heading =
                                                            e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            startupOverview:
                                                                updated,
                                                        });
                                                    }}
                                                    className="input-focus w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Content
                                                </label>
                                                <textarea
                                                    placeholder="Describe this aspect of your startup in detail..."
                                                    value={section.paragraph}
                                                    onChange={(e) => {
                                                        const updated = [
                                                            ...formData.startupOverview,
                                                        ];
                                                        updated[i].paragraph =
                                                            e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            startupOverview:
                                                                updated,
                                                        });
                                                    }}
                                                    rows={4}
                                                    className="input-focus w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none text-slate-900 placeholder:text-slate-400 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Funding Rounds Section */}
                    <section className="section-card bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Funding History
                                    </h2>
                                    <p className="text-sm text-slate-600">
                                        Track your fundraising journey
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={addFundingRound}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-lg transition-colors"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Add Round
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {formData.fundingRound.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                                    <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-4">
                                        No funding rounds added yet
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={addFundingRound}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                        Add First Round
                                    </Button>
                                </div>
                            ) : (
                                formData.fundingRound.map((round, i) => (
                                    <div
                                        key={i}
                                        className="item-card p-6 border-2 border-slate-200 rounded-xl hover:border-amber-300 transition-colors duration-75 delay-75"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                                    Round {round.round}
                                                </span>
                                                {round.isCurrent && (
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                        <Sparkles className="w-3 h-3" />
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    removeFundingRound(i)
                                                }
                                                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Round Number
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={round.round}
                                                    onChange={(e) => {
                                                        const updated = [
                                                            ...formData.fundingRound,
                                                        ];
                                                        updated[i].round =
                                                            Number(
                                                                e.target.value,
                                                            );
                                                        setFormData({
                                                            ...formData,
                                                            fundingRound:
                                                                updated,
                                                        });
                                                    }}
                                                    className="input-focus w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Amount ($)
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="500000"
                                                    value={round.amount || ""}
                                                    onChange={(e) => {
                                                        const updated = [
                                                            ...formData.fundingRound,
                                                        ];
                                                        updated[i].amount =
                                                            Number(
                                                                e.target.value,
                                                            );
                                                        setFormData({
                                                            ...formData,
                                                            fundingRound:
                                                                updated,
                                                        });
                                                    }}
                                                    className="input-focus w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Date
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={
                                                        round.date
                                                            .toString()
                                                            .split("T")[0]
                                                    }
                                                    onChange={(e) => {
                                                        const updated = [
                                                            ...formData.fundingRound,
                                                        ];
                                                        updated[i].date =
                                                            e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            fundingRound:
                                                                updated,
                                                        });
                                                    }}
                                                    className="input-focus w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900"
                                                />
                                            </div>

                                            <div className="md:col-span-3">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <Input
                                                        type="checkbox"
                                                        checked={
                                                            round.isCurrent
                                                        }
                                                        onChange={(e) => {
                                                            const updated = [
                                                                ...formData.fundingRound,
                                                            ];
                                                            updated[
                                                                i
                                                            ].isCurrent =
                                                                e.target.checked;
                                                            setFormData({
                                                                ...formData,
                                                                fundingRound:
                                                                    updated,
                                                            });
                                                        }}
                                                        className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                                                    />
                                                    <span className="text-sm font-medium text-slate-700">
                                                        This is our current
                                                        funding round
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Team Section */}
                    <section className="section-card bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Team Members
                                    </h2>
                                    <p className="text-sm text-slate-600">
                                        Introduce your key players
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={addTeamMember}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium rounded-lg transition-colors"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Add Member
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {formData.team.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-4">
                                        No team members added yet
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={addTeamMember}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                        Add First Team Member
                                    </Button>
                                </div>
                            ) : (
                                formData.team.map((member, i) => (
                                    <div
                                        key={i}
                                        className="item-card p-6 border-2 border-slate-200 rounded-xl hover:border-indigo-300 transition-colors duration-75 delay-75"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                                                Member {i + 1}
                                            </span>
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    removeTeamMember(i)
                                                }
                                                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Name
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="e.g., Jane Doe"
                                                    value={member.name}
                                                    onChange={(e) => {
                                                        const updated = [
                                                            ...formData.team,
                                                        ];
                                                        updated[i].name =
                                                            e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            team: updated,
                                                        });
                                                    }}
                                                    className="input-focus w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Role
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="e.g., CEO, CTO, Head of Product"
                                                    value={member.role}
                                                    onChange={(e) => {
                                                        const updated = [
                                                            ...formData.team,
                                                        ];
                                                        updated[i].role =
                                                            e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            team: updated,
                                                        });
                                                    }}
                                                    className="input-focus w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Avatar URL (optional)
                                                </label>
                                                <Input
                                                    type="url"
                                                    placeholder="https://example.com/avatar.jpg"
                                                    value={member.avatarUrl}
                                                    onChange={(e) => {
                                                        const updated = [
                                                            ...formData.team,
                                                        ];
                                                        updated[i].avatarUrl =
                                                            e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            team: updated,
                                                        });
                                                    }}
                                                    className="input-focus w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Submit Button */}
                    <div className="flex items-center justify-between pt-8 border-t border-slate-200">
                        <p className="text-sm text-slate-600">
                            * Required fields
                        </p>
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="btn-primary flex items-center gap-3 px-8 py-4 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isUpdating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Profile
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default EntrepreneurEditProfile;
