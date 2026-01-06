import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatCurrency";

interface RevenueChartProps {
    data: Array<{ date: string; revenue: number; count: number }>;
}

const COLORS = ["#f97316", "#0ea5e9", "#22c55e", "#eab308", "#a855f7", "#ec4899"];

export function RevenueAreaChart({ data }: RevenueChartProps) {
    const chartData = useMemo(() => {
        return data.map((item) => ({
            ...item,
            formattedDate: new Date(item.date).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
            }),
        }));
    }, [data]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Revenue Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="formattedDate" fontSize={12} tickLine={false} axisLine={false} className="fill-muted-foreground" />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} className="fill-muted-foreground" />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                                                <p className="text-sm font-medium">{payload[0].payload.formattedDate}</p>
                                                <p className="text-sm text-primary font-bold">{formatCurrency(payload[0].value as number)}</p>
                                                <p className="text-xs text-muted-foreground">{payload[0].payload.count} inquiries</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

interface StatusChartProps {
    data: Array<{ status: string; count: number }>;
}

export function InquiryStatusPieChart({ data }: StatusChartProps) {
    const total = useMemo(() => data.reduce((sum, item) => sum + item.count, 0), [data]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Inquiry Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="count" nameKey="status" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-lg">
                                                <p className="text-sm font-medium capitalize">{payload[0].name}</p>
                                                <p className="text-sm">{payload[0].value} inquiries</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">Total: {total} inquiries</p>
            </CardContent>
        </Card>
    );
}

interface CategoryChartProps {
    data: Array<{ name: string; itemCount: number; revenue: number }>;
}

export function CategoryBarChart({ data }: CategoryChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                            <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} className="fill-muted-foreground" />
                            <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} width={120} className="fill-muted-foreground" />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-lg">
                                                <p className="text-sm font-medium">{payload[0].payload.name}</p>
                                                <p className="text-sm text-primary font-bold">{formatCurrency(payload[0].value as number)}</p>
                                                <p className="text-xs text-muted-foreground">{payload[0].payload.itemCount} items sold</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="revenue" fill="#f97316" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

interface PopularItemsChartProps {
    data: Array<{ name: string; count: number; revenue: number }>;
}

export function PopularItemsBarChart({ data }: PopularItemsChartProps) {
    const topItems = useMemo(() => data.slice(0, 10), [data]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Top 10 Popular Items</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topItems} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                            <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} className="fill-muted-foreground" />
                            <YAxis
                                type="category"
                                dataKey="name"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                width={150}
                                className="fill-muted-foreground"
                                tickFormatter={(value) => (value.length > 20 ? `${value.slice(0, 18)}...` : value)}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-lg">
                                                <p className="text-sm font-medium">{payload[0].payload.name}</p>
                                                <p className="text-sm">Ordered {payload[0].value} times</p>
                                                <p className="text-xs text-primary">Revenue: {formatCurrency(payload[0].payload.revenue)}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
