import { useState, useEffect } from "react";
import {
    PlusCircle,
    Trash2,
    Save,
    DollarSign,
    Briefcase,
    TrendingUp,
    MapPin,
    Target,
    PieChart,
    Award,
    Check,
    X,
    ArrowLeft,
    Building2,
} from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useSelector } from "react-redux";
import {
    useGetInvestorByIdQuery,
    useUpdateInvestorMutation,
} from "../../services/auth.service";
import { IPortfolioCompanies, IInvestmentInterests } from "../../types";

export default function InvestorEditProfile() {
    const { _id: currentUserId } = useSelector((state: any) => state.auth);

    const { data, isLoading, isError } = useGetInvestorByIdQuery(
        currentUserId,
        {
            skip: !currentUserId,
        },
    );

    const [updateInvestor, { isLoading: isUpdating }] =
        useUpdateInvestorMutation();

    const [formData, setFormData] = useState({
        bio: "",
        location: "",
        investmentRange: { minAmount: 0, maxAmount: 0 },
        totalInvestments: 0,
        investmentInterests: [] as IInvestmentInterests[],
        investmentStages: [] as string[],
        portfolioCompanies: [] as IPortfolioCompanies[],
        investmentCriteria: [] as string[],
    });

    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (!data) return;

        setFormData({
            bio: data.bio ?? "",
            location: data.location ?? "",
            investmentRange: {
                minAmount: data.investmentRange?.minAmount ?? 0,
                maxAmount: data.investmentRange?.maxAmount ?? 0,
            },
            totalInvestments: data.totalInvestments ?? 0,
            investmentInterests: data.investmentInterests ?? [],
            investmentStages: data.investmentStages ?? [],
            portfolioCompanies: data.portfolioCompanies ?? [],
            investmentCriteria: data.investmentCriteria ?? [],
        });
    }, [data]);

    const addInvestmentInterest = () => {
        setFormData((p) => ({
            ...p,
            investmentInterests: [
                ...p.investmentInterests,
                { interest: "", percentage: 0 },
            ],
        }));
        setActiveSection(`interest-${formData.investmentInterests.length}`);
    };

    const removeInvestmentInterest = (index: number) => {
        setFormData((p) => ({
            ...p,
            investmentInterests: p.investmentInterests.filter(
                (_, i) => i !== index,
            ),
        }));
    };

    const addPortfolioCompany = () => {
        setFormData((p) => ({
            ...p,
            portfolioCompanies: [
                ...p.portfolioCompanies,
                {
                    name: "",
                    date: new Date().toISOString().split("T")[0],
                    amountInvested: 0,
                },
            ],
        }));
        setActiveSection(`portfolio-${formData.portfolioCompanies.length}`);
    };

    const removePortfolioCompany = (index: number) => {
        setFormData((p) => ({
            ...p,
            portfolioCompanies: p.portfolioCompanies.filter(
                (_, i) => i !== index,
            ),
        }));
    };

    const addInvestmentStage = () => {
        setFormData((p) => ({
            ...p,
            investmentStages: [...p.investmentStages, ""],
        }));
    };

    const removeInvestmentStage = (index: number) => {
        setFormData((p) => ({
            ...p,
            investmentStages: p.investmentStages.filter((_, i) => i !== index),
        }));
    };

    const addCriterion = () => {
        setFormData((p) => ({
            ...p,
            investmentCriteria: [...p.investmentCriteria, ""],
        }));
    };

    const removeCriterion = (index: number) => {
        setFormData((p) => ({
            ...p,
            investmentCriteria: p.investmentCriteria.filter(
                (_, i) => i !== index,
            ),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateInvestor({
                id: currentUserId,
                payload: formData,
            }).unwrap();

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert("Update failed. Please try again.");
        }
    };

    const investmentStageOptions = [
        "Pre-Seed",
        "Seed",
        "Series A",
        "Series B",
        "Series C",
        "Series D+",
        "Growth",
        "Late Stage",
    ];

    if (isLoading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-600 font-medium">
                        Loading your profile...
                    </p>
                </div>
            </div>
        );

    if (isError)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center space-y-4 p-4 bg-white rounded-lg shadow-xl max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <X className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                        Failed to Load Profile
                    </h3>
                    <p className="text-slate-600">
                        We couldn't retrieve your profile data. Please refresh
                        the page or try again later.
                    </p>
                </div>
            </div>
        );

    const totalInterestPercentage = formData.investmentInterests.reduce(
        (sum, item) => sum + (item.percentage || 0),
        0,
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
            {/* Success Toast */}
            {saveSuccess && (
                <div className="fixed top-6 right-6 z-50 success-toast">
                    <div className="bg-white rounded-xl shadow-2xl p-4 flex items-center gap-3 border-l-4 border-indigo-500">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">
                                Profile Updated!
                            </p>
                            <p className="text-sm text-slate-600">
                                Your changes have been saved successfully
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="profile-container max-w-6xl mx-auto px-4 sm:px-3 lg:px-8 p-3">
                {/* Header */}
                <div className="mb-12">
                    <Button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            Back to Dashboard
                        </span>
                    </Button>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-3">
                                Edit Your{" "}
                                <span className="gradient-text">
                                    Investor Profile
                                </span>
                            </h1>
                            <p className="text-md text-slate-600 max-w-2xl">
                                Showcase your investment expertise and connect
                                with promising startups.
                            </p>
                        </div>
                        <div className="stat-badge px-3 py-3 rounded-xl border border-gray-300">
                            <p className="text-xs text-slate-500 mb-1">
                                Profile Completion
                            </p>
                            <p className="text-xl font-bold text-indigo-600">
                                {Math.round(
                                    ((formData.bio ? 1 : 0) +
                                        (formData.location ? 1 : 0) +
                                        (formData.investmentInterests.length > 0
                                            ? 1
                                            : 0) +
                                        (formData.investmentStages.length > 0
                                            ? 1
                                            : 0) +
                                        (formData.portfolioCompanies.length > 0
                                            ? 1
                                            : 0) +
                                        (formData.investmentCriteria.length > 0
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
                    <section className="section-card bg-white rounded-lg p-4 shadow-lg border border-gray-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Core Identity
                                </h2>
                                <p className="text-sm text-slate-600">
                                    Your professional foundation
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Location *
                                </label>
                                <Input
                                    type="text"
                                    placeholder="e.g., New York, NY"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            location: e.target.value,
                                        })
                                    }
                                    className="input-focus w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Bio *
                                </label>
                                <textarea
                                    placeholder="Share your investment philosophy, experience, and what drives your investment decisions..."
                                    value={formData.bio}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            bio: e.target.value,
                                        })
                                    }
                                    rows={5}
                                    className="input-focus w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none text-slate-900 placeholder:text-slate-400 resize-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Award className="w-4 h-4" />
                                    Total Investments Made
                                </label>
                                <Input
                                    type="number"
                                    placeholder="Number of companies invested in"
                                    value={formData.totalInvestments || ""}
                                    min="0"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            totalInvestments: Number(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                    className="input-focus w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Investment Range Section */}
                    <section className="section-card bg-white rounded-lg p-4 shadow-lg border border-gray-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Investment Range
                                </h2>
                                <p className="text-sm text-slate-600">
                                    Your typical investment size
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Minimum Investment ($) *
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="number"
                                        placeholder="50000"
                                        value={
                                            formData.investmentRange
                                                .minAmount || ""
                                        }
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                investmentRange: {
                                                    ...formData.investmentRange,
                                                    minAmount: +e.target.value,
                                                },
                                            })
                                        }
                                        className="input-focus w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Maximum Investment ($) *
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="number"
                                        placeholder="500000"
                                        value={
                                            formData.investmentRange
                                                .maxAmount || ""
                                        }
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                investmentRange: {
                                                    ...formData.investmentRange,
                                                    maxAmount: +e.target.value,
                                                },
                                            })
                                        }
                                        className="input-focus w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {formData.investmentRange.minAmount > 0 &&
                            formData.investmentRange.maxAmount > 0 && (
                                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <p className="text-sm text-emerald-800 font-medium">
                                        Investment Range:{" "}
                                        <span className="font-bold">
                                            $
                                            {formData.investmentRange.minAmount.toLocaleString()}{" "}
                                            - $
                                            {formData.investmentRange.maxAmount.toLocaleString()}
                                        </span>
                                    </p>
                                </div>
                            )}
                    </section>

                    {/* Investment Interests Section */}
                    <section className="section-card bg-white rounded-lg p-4 shadow-lg border border-gray-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <PieChart className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Investment Interests
                                    </h2>
                                    <p className="text-sm text-slate-600">
                                        Industries you invest in with allocation
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={addInvestmentInterest}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium rounded-lg transition-colors"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Add Interest
                            </Button>
                        </div>

                        {totalInterestPercentage > 0 && (
                            <div className="mb-4 p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-slate-700">
                                        Total Allocation
                                    </span>
                                    <span
                                        className={`text-sm font-bold ${
                                            totalInterestPercentage === 100
                                                ? "text-emerald-600"
                                                : totalInterestPercentage > 100
                                                  ? "text-red-600"
                                                  : "text-amber-600"
                                        }`}
                                    >
                                        {totalInterestPercentage}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3">
                                    <div
                                        className={`percentage-bar h-3 rounded-full ${
                                            totalInterestPercentage === 100
                                                ? "bg-emerald-500"
                                                : totalInterestPercentage > 100
                                                  ? "bg-red-500"
                                                  : "bg-amber-500"
                                        }`}
                                        style={{
                                            width: `${Math.min(totalInterestPercentage, 100)}%`,
                                        }}
                                    ></div>
                                </div>
                                {totalInterestPercentage !== 100 && (
                                    <p className="text-xs text-slate-600 mt-2">
                                        {totalInterestPercentage > 100
                                            ? "Total exceeds 100%. Please adjust."
                                            : `${100 - totalInterestPercentage}% remaining to allocate`}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-6">
                            {formData.investmentInterests.length === 0 ? (
                                <div className="text-center p-3 border border-dashed border-gray-300 rounded-xl">
                                    <PieChart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-4">
                                        No investment interests added yet
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={addInvestmentInterest}
                                        className="inline-flex items-center gap-2 px-3 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                        Add First Interest
                                    </Button>
                                </div>
                            ) : (
                                formData.investmentInterests.map(
                                    (interest, i) => (
                                        <div
                                            key={i}
                                            className="item-card p-2 border border-gray-300 rounded-xl hover:border-purple-300 transition-colors"
                                            style={{
                                                animationDelay: `${i * 0.1}s`,
                                            }}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                                    Interest {i + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        removeInvestmentInterest(
                                                            i,
                                                        )
                                                    }
                                                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Industry *
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        placeholder="e.g., SaaS, FinTech, HealthTech"
                                                        value={
                                                            interest.interest
                                                        }
                                                        onChange={(e) => {
                                                            const updated = [
                                                                ...formData.investmentInterests,
                                                            ];
                                                            updated[
                                                                i
                                                            ].interest =
                                                                e.target.value;
                                                            setFormData({
                                                                ...formData,
                                                                investmentInterests:
                                                                    updated,
                                                            });
                                                        }}
                                                        className="input-focus w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Allocation (%) *
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        placeholder="25"
                                                        min="0"
                                                        max="100"
                                                        value={
                                                            interest.percentage ||
                                                            ""
                                                        }
                                                        onChange={(e) => {
                                                            const updated = [
                                                                ...formData.investmentInterests,
                                                            ];
                                                            updated[
                                                                i
                                                            ].percentage =
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                );
                                                            setFormData({
                                                                ...formData,
                                                                investmentInterests:
                                                                    updated,
                                                            });
                                                        }}
                                                        className="input-focus w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )
                            )}
                        </div>
                    </section>

                    {/* Investment Stages Section */}
                    <section className="section-card bg-white rounded-lg p-4 shadow-lg border border-gray-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Investment Stages
                                    </h2>
                                    <p className="text-sm text-slate-600">
                                        Stages you typically invest in
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={addInvestmentStage}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-colors"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Add Stage
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {formData.investmentStages.length === 0 ? (
                                <div className="text-center p-3 border border-dashed border-gray-300 rounded-xl">
                                    <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-4">
                                        No investment stages selected yet
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={addInvestmentStage}
                                        className="inline-flex items-center gap-2 px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                        Add First Stage
                                    </Button>
                                </div>
                            ) : (
                                formData.investmentStages.map((stage, i) => (
                                    <div
                                        key={i}
                                        className="item-card flex items-center gap-4 p-4 border border-gray-300 rounded-xl hover:border-blue-300 transition-colors"
                                        style={{
                                            animationDelay: `${i * 0.05}s`,
                                        }}
                                    >
                                        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                                            {i + 1}
                                        </span>
                                        <select
                                            title="investmentStates"
                                            value={stage}
                                            onChange={(e) => {
                                                const updated = [
                                                    ...formData.investmentStages,
                                                ];
                                                updated[i] = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    investmentStages: updated,
                                                });
                                            }}
                                            className="input-focus flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-slate-900"
                                            required
                                        >
                                            <option value="">
                                                Select a stage
                                            </option>
                                            {investmentStageOptions.map(
                                                (opt) => (
                                                    <option
                                                        key={opt}
                                                        value={opt}
                                                    >
                                                        {opt}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                removeInvestmentStage(i)
                                            }
                                            className="flex-shrink-0 p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Portfolio Companies Section */}
                    <section className="section-card bg-white rounded-lg p-4 shadow-lg border border-gray-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Portfolio Companies
                                    </h2>
                                    <p className="text-sm text-slate-600">
                                        Companies you've invested in
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={addPortfolioCompany}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-lg transition-colors"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Add Company
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {formData.portfolioCompanies.length === 0 ? (
                                <div className="text-center p-3 border border-dashed border-gray-300 rounded-xl">
                                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-4">
                                        No portfolio companies added yet
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={addPortfolioCompany}
                                        className="inline-flex items-center gap-2 px-3 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                        Add First Company
                                    </Button>
                                </div>
                            ) : (
                                formData.portfolioCompanies.map(
                                    (company, i) => (
                                        <div
                                            key={i}
                                            className="item-card p-2 border border-gray-300 rounded-xl hover:border-amber-300 transition-colors"
                                            style={{
                                                animationDelay: `${i * 0.1}s`,
                                            }}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                                    Company {i + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        removePortfolioCompany(
                                                            i,
                                                        )
                                                    }
                                                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Company Name *
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        placeholder="e.g., TechStartup Inc."
                                                        value={company.name}
                                                        onChange={(e) => {
                                                            const updated = [
                                                                ...formData.portfolioCompanies,
                                                            ];
                                                            updated[i].name =
                                                                e.target.value;
                                                            setFormData({
                                                                ...formData,
                                                                portfolioCompanies:
                                                                    updated,
                                                            });
                                                        }}
                                                        className="input-focus w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Investment Date *
                                                    </label>
                                                    <Input
                                                        type="date"
                                                        value={company.date}
                                                        onChange={(e) => {
                                                            const updated = [
                                                                ...formData.portfolioCompanies,
                                                            ];
                                                            updated[i].date =
                                                                e.target.value;
                                                            setFormData({
                                                                ...formData,
                                                                portfolioCompanies:
                                                                    updated,
                                                            });
                                                        }}
                                                        className="input-focus w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Amount Invested ($) *
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        placeholder="100000"
                                                        value={
                                                            company.amountInvested ||
                                                            ""
                                                        }
                                                        onChange={(e) => {
                                                            const updated = [
                                                                ...formData.portfolioCompanies,
                                                            ];
                                                            updated[
                                                                i
                                                            ].amountInvested =
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                );
                                                            setFormData({
                                                                ...formData,
                                                                portfolioCompanies:
                                                                    updated,
                                                            });
                                                        }}
                                                        className="input-focus w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-amber-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )
                            )}
                        </div>
                    </section>

                    {/* Investment Criteria Section */}
                    <section className="section-card bg-white rounded-lg p-4 shadow-lg border border-gray-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Investment Criteria
                                    </h2>
                                    <p className="text-sm text-slate-600">
                                        What you look for in startups
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={addCriterion}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-medium rounded-lg transition-colors"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Add Criterion
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {formData.investmentCriteria.length === 0 ? (
                                <div className="text-center p-3 border border-dashed border-gray-300 rounded-xl">
                                    <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-4">
                                        No investment criteria added yet
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={addCriterion}
                                        className="inline-flex items-center gap-2 px-3 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition-colors"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                        Add First Criterion
                                    </Button>
                                </div>
                            ) : (
                                formData.investmentCriteria.map(
                                    (criterion, i) => (
                                        <div
                                            key={i}
                                            className="item-card flex items-center gap-4 p-4 border border-gray-300 rounded-xl hover:border-rose-300 transition-colors"
                                            style={{
                                                animationDelay: `${i * 0.05}s`,
                                            }}
                                        >
                                            <span className="flex-shrink-0 w-8 h-8 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center text-sm font-bold">
                                                {i + 1}
                                            </span>
                                            <Input
                                                type="text"
                                                placeholder="e.g., Strong founding team, Product-market fit, Scalable business model"
                                                value={criterion}
                                                onChange={(e) => {
                                                    const updated = [
                                                        ...formData.investmentCriteria,
                                                    ];
                                                    updated[i] = e.target.value;
                                                    setFormData({
                                                        ...formData,
                                                        investmentCriteria:
                                                            updated,
                                                    });
                                                }}
                                                className="input-focus flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:border-rose-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                            />
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    removeCriterion(i)
                                                }
                                                className="flex-shrink-0 p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ),
                                )
                            )}
                        </div>
                    </section>

                    {/* Submit Button */}
                    <div className="flex items-center justify-between pt-8 border-t border-gray-300">
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
                                    <div className="w-5 h-5 border border-white border-t-transparent rounded-full animate-spin"></div>
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
}
