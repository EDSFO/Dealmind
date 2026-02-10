'use client'

import React, { useState } from 'react'
import {
    Calendar,
    ChevronDown,
    Clock,
    MoreHorizontal,
    Smile,
    BarChart2,
    TrendingUp,
    User,
    Users,
    Video,
    Timer
} from 'lucide-react'
import { cn } from '~/lib/utils'
import { api } from '~/trpc/react'

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState<'7days' | 'month' | '3months'>('7days')
    const [selectedMetric, setSelectedMetric] = useState('performance')

    const { data, isLoading } = api.user.getAnalytics.useQuery({ timeRange })

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F5F8FA] p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const metrics = data?.metrics || { performance: 0, successPrediction: 0, customerMood: 0 }
    const stats = data?.stats || { meetings: 0, duration: '0m', delay: '0s', spokenTime: 'N/A' }
    const chartData = data?.chartData || []

    // Format date range for display
    const endDate = new Date()
    const startDate = new Date()
    if (timeRange === '7days') startDate.setDate(endDate.getDate() - 7)
    if (timeRange === 'month') startDate.setMonth(endDate.getMonth() - 1)
    if (timeRange === '3months') startDate.setMonth(endDate.getMonth() - 3)

    const dateRangeStr = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`

    return (
        <div className="min-h-screen bg-[#F5F8FA] p-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e293b]">
                        Análise de Performance
                    </h1>
                </div>
                <button className="px-4 py-2 bg-white border border-blue-200 text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors shadow-sm">
                    View reports
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">

                {/* Channel Selector */}
                <div className="relative group">
                    <label className="text-xs font-bold text-gray-400 absolute -top-2 left-3 bg-white px-1">Channels</label>
                    <button className="w-full md:w-64 flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-700 font-medium hover:border-blue-400 transition-colors">
                        <span className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-gray-400" />
                            Meetings
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Time Range Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Toggles */}
                    <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                        <button
                            onClick={() => setTimeRange('7days')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
                                timeRange === '7days' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Last 7 Days
                        </button>
                        <button
                            onClick={() => setTimeRange('month')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
                                timeRange === 'month' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Last Month
                        </button>
                        <button
                            onClick={() => setTimeRange('3months')}
                            className={cn(
                                "px-4 py-1.5 text-sm font-semibold rounded-md transition-all",
                                timeRange === '3months' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Last 3 Months
                        </button>
                    </div>

                    {/* Date Picker Display */}
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-600 relative">
                        <label className="text-[10px] font-bold text-gray-400 absolute -top-2 left-2 bg-white px-1">Date range</label>
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{dateRangeStr}</span>
                    </div>
                </div>
            </div>

            {/* Metrics Row 1: KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* Performance Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        <h3 className="text-sm font-bold text-gray-500">Performance</h3>
                    </div>

                    <div className="flex items-end justify-between mb-2">
                        <span className="text-xs font-bold text-blue-500">0</span>
                        <span className="text-3xl font-bold text-gray-800">{metrics.performance} <span className="text-lg text-gray-400 font-medium">/ 10</span></span>
                        <span className="text-xs font-bold text-gray-400">10</span>
                    </div>

                    {/* Custom Slider Visualization */}
                    <div className="relative h-2 bg-gray-100 rounded-full w-full">
                        <div
                            className="absolute top-0 left-0 h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)] transition-all duration-1000 ease-out"
                            style={{ width: `${(metrics.performance / 10) * 100}%` }}
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-blue-600 rounded-full shadow-md transition-all duration-1000 ease-out"
                            style={{ left: `${(metrics.performance / 10) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Success Prediction Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <User className="w-5 h-5 text-blue-500" />
                        <h3 className="text-sm font-bold text-gray-500">Success prediction</h3>
                    </div>

                    <div className="flex items-end justify-between">
                        {/* Dot Scale */}
                        <div className="flex gap-2 mb-1">
                            {[1, 2, 3, 4, 5].map((dot) => (
                                <div
                                    key={dot}
                                    className={cn(
                                        "w-5 h-5 rounded-full transition-all duration-500",
                                        dot <= metrics.successPrediction
                                            ? "bg-blue-600 shadow-sm scale-110"
                                            : "border-2 border-gray-200 bg-white"
                                    )}
                                    style={{ transitionDelay: `${dot * 100}ms` }}
                                />
                            ))}
                        </div>
                        <span className="text-3xl font-bold text-gray-800">{metrics.successPrediction}</span>
                    </div>
                </div>

                {/* Customer Mood Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Smile className="w-5 h-5 text-blue-500" />
                        <h3 className="text-sm font-bold text-gray-500">Customer's mood</h3>
                    </div>

                    <div className="flex items-end justify-between mb-2">
                        <Smile className="w-4 h-4 text-gray-400" />
                        <Smile className="w-4 h-4 text-gray-400" />
                        <Smile className="w-4 h-4 text-gray-400" />
                    </div>

                    {/* Gradient Bar Visualization */}
                    <div className="relative h-2 w-full bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full opacity-30">
                        {/* Background Ref */}
                    </div>
                    <div className="relative h-2 w-full -mt-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 rounded-full relative transition-all duration-1000 ease-out"
                            style={{ width: `${(metrics.customerMood / 5) * 100}%` }}
                        >
                        </div>
                    </div>
                    <div className="flex justify-end mt-2">
                        <span className="text-3xl font-bold text-gray-800">{metrics.customerMood}</span>
                    </div>
                </div>
            </div>

            {/* Metrics Row 2: Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Number of meetings', value: stats.meetings, icon: Users },
                    { label: 'meetings duration', value: stats.duration, icon: Clock },
                    { label: 'Delay time', value: stats.delay, icon: Timer },
                    { label: 'Spoken Time by Sales Reps (%)', value: stats.spokenTime, icon: BarChart2 },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1 duration-300">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">{stat.label}</h3>
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-gray-800">{stat.value}</span>
                            {/* <stat.icon className="w-6 h-6 text-gray-200" /> */}
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">

                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-6 mb-8 border-b border-gray-100 pb-1">
                    {[
                        { id: 'performance', label: 'Performance', icon: User },
                        { id: 'success', label: 'Success Prediction', icon: TrendingUp },
                        { id: 'meetings', label: 'Number Of Meetings', icon: Video },
                        { id: 'duration', label: 'Meetings Duration', icon: Clock },
                        { id: 'delay', label: 'Delay Time', icon: Timer },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedMetric(tab.id)}
                            className={cn(
                                "pb-4 flex items-center gap-2 text-sm font-semibold transition-all relative",
                                selectedMetric === tab.id ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <tab.icon className={cn("w-4 h-4", selectedMetric === tab.id ? "text-blue-600" : "text-gray-400")} />
                            {tab.label}
                            {selectedMetric === tab.id && (
                                <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-blue-600 rounded-t-full shadow-[0_-2px_6px_rgba(37,99,235,0.3)]" />
                            )}
                            {selectedMetric === tab.id && (
                                <div className="absolute inset-0 bg-blue-50/50 -z-10 rounded-t-lg opacity-0" />
                                // Optional hover effect background
                            )}
                        </button>
                    ))}
                    <button className="ml-auto pb-4 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* Chart Visualization */}
                <div className="h-[400px] w-full relative pt-6 pl-6">

                    {/* Y-Axis Labels */}
                    <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs font-medium text-gray-400">
                        {[10, 8, 6, 4, 2, 0].map(val => (
                            <span key={val} className="transform -translate-y-1/2">{val}</span>
                        ))}
                    </div>

                    {/* Grid Lines */}
                    <div className="absolute left-6 right-0 top-0 bottom-8 flex flex-col justify-between">
                        {[10, 8, 6, 4, 2, 0].map(val => (
                            <div key={val} className="w-full h-px bg-gray-100" />
                        ))}
                    </div>

                    {/* Bars */}
                    <div className="absolute left-6 right-0 bottom-8 px-4 md:px-12 flex items-end justify-around h-[calc(100%-32px)]">
                        {chartData.map((d, i) => (
                            <div key={d.date} className="w-full max-w-[60px] mx-1 h-full relative group flex flex-col justify-end">
                                <div
                                    className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg shadow-lg shadow-blue-200/50 hover:opacity-90 transition-all cursor-pointer relative"
                                    style={{ height: `${Math.min(100, Math.max(5, d.value * 10))}%` }} // Scale: 1 meeting = 10% height for visual effect, min 5%
                                >
                                    {/* Tooltip */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                                        {d.value} Meetings
                                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {chartData.length === 0 && (
                            <div className="text-gray-400 text-sm italic absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-lg border shadow-sm">
                                Nenhuma atividade registrada no período.
                            </div>
                        )}
                    </div>

                    {/* X-Axis Labels */}
                    <div className="absolute left-6 right-0 bottom-0 flex justify-around pt-2 px-4 md:px-12">
                        {chartData.filter((_, i) => i % Math.ceil(chartData.length / 5) === 0).map((d) => ( // Show only ~5 labels
                            <span key={d.date} className="text-xs font-medium text-gray-500">{d.date}</span>
                        ))}
                    </div>

                </div>

            </div>

        </div>
    )
}
