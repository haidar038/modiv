import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FolderOpen, FileText, ClipboardList, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/formatCurrency";
import { RevenueAreaChart, InquiryStatusPieChart, CategoryBarChart, PopularItemsBarChart } from "@/components/admin/AnalyticsCharts";

interface DashboardStats {
    categoriesCount: number;
    itemsCount: number;
    templatesCount: number;
    inquiriesCount: number;
    pendingInquiries: number;
    totalRevenue: number;
}

interface RevenueData {
    date: string;
    revenue: number;
    count: number;
}

interface StatusData {
    status: string;
    count: number;
}

interface CategoryData {
    name: string;
    itemCount: number;
    revenue: number;
}

interface PopularItemData {
    name: string;
    count: number;
    revenue: number;
}

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats>({
        categoriesCount: 0,
        itemsCount: 0,
        templatesCount: 0,
        inquiriesCount: 0,
        pendingInquiries: 0,
        totalRevenue: 0,
    });
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [statusData, setStatusData] = useState<StatusData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [popularItems, setPopularItems] = useState<PopularItemData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch basic stats
                const [categoriesRes, itemsRes, templatesRes, inquiriesRes] = await Promise.all([
                    supabase.from("categories").select("id", { count: "exact", head: true }),
                    supabase.from("items").select("id", { count: "exact", head: true }),
                    supabase.from("event_templates").select("id", { count: "exact", head: true }),
                    supabase.from("inquiries").select("id, status, total, created_at"),
                ]);

                const inquiries = inquiriesRes.data || [];
                const pendingInquiries = inquiries.filter((i) => i.status === "pending").length;
                const totalRevenue = inquiries.filter((i) => i.status === "completed").reduce((sum, i) => sum + Number(i.total || 0), 0);

                setStats({
                    categoriesCount: categoriesRes.count || 0,
                    itemsCount: itemsRes.count || 0,
                    templatesCount: templatesRes.count || 0,
                    inquiriesCount: inquiries.length,
                    pendingInquiries,
                    totalRevenue,
                });

                // Revenue trend (last 30 days)
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const revenueByDate: Record<string, { revenue: number; count: number }> = {};
                for (let i = 0; i < 30; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() - (29 - i));
                    const dateStr = date.toISOString().split("T")[0];
                    revenueByDate[dateStr] = { revenue: 0, count: 0 };
                }

                inquiries.forEach((inq) => {
                    const dateStr = new Date(inq.created_at).toISOString().split("T")[0];
                    if (revenueByDate[dateStr]) {
                        revenueByDate[dateStr].revenue += Number(inq.total || 0);
                        revenueByDate[dateStr].count += 1;
                    }
                });

                setRevenueData(
                    Object.entries(revenueByDate).map(([date, data]) => ({
                        date,
                        ...data,
                    }))
                );

                // Status distribution
                const statusCounts: Record<string, number> = {};
                inquiries.forEach((inq) => {
                    const status = inq.status || "unknown";
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                });
                setStatusData(Object.entries(statusCounts).map(([status, count]) => ({ status, count })));

                // Fetch inquiry items for category and popular items analysis
                const { data: inquiryItems } = await supabase.from("inquiry_items").select("item_name, quantity, price_at_time, items(category_id, categories(name))");

                if (inquiryItems) {
                    // Category revenue
                    const categoryRevenue: Record<string, { itemCount: number; revenue: number }> = {};
                    inquiryItems.forEach((item) => {
                        const catName = (item.items as { categories: { name: string } } | null)?.categories?.name || "Uncategorized";
                        if (!categoryRevenue[catName]) {
                            categoryRevenue[catName] = { itemCount: 0, revenue: 0 };
                        }
                        categoryRevenue[catName].itemCount += item.quantity;
                        categoryRevenue[catName].revenue += item.price_at_time * item.quantity;
                    });
                    setCategoryData(
                        Object.entries(categoryRevenue)
                            .map(([name, data]) => ({ name, ...data }))
                            .sort((a, b) => b.revenue - a.revenue)
                    );

                    // Popular items
                    const itemCounts: Record<string, { count: number; revenue: number }> = {};
                    inquiryItems.forEach((item) => {
                        if (!itemCounts[item.item_name]) {
                            itemCounts[item.item_name] = { count: 0, revenue: 0 };
                        }
                        itemCounts[item.item_name].count += item.quantity;
                        itemCounts[item.item_name].revenue += item.price_at_time * item.quantity;
                    });
                    setPopularItems(
                        Object.entries(itemCounts)
                            .map(([name, data]) => ({ name, ...data }))
                            .sort((a, b) => b.count - a.count)
                    );
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            title: "Kategori",
            value: stats.categoriesCount,
            icon: FolderOpen,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Item",
            value: stats.itemsCount,
            icon: Package,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            title: "Template",
            value: stats.templatesCount,
            icon: FileText,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "Total Permintaan",
            value: stats.inquiriesCount,
            icon: ClipboardList,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Dasbor</h1>
                <p className="text-muted-foreground">Analitik dan ringkasan platform acara Anda.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Card key={card.title}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                                <div className={`rounded-lg p-2 ${card.bgColor}`}>
                                    <Icon className={`h-4 w-4 ${card.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Revenue & Pending */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            Permintaan Tertunda
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-primary">{stats.pendingInquiries}</div>
                        <p className="text-sm text-muted-foreground">Permintaan menunggu respon</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Total Pendapatan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-500">{formatCurrency(stats.totalRevenue)}</div>
                        <p className="text-sm text-muted-foreground">Dari permintaan yang selesai</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                <RevenueAreaChart data={revenueData} />
                <InquiryStatusPieChart data={statusData} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <CategoryBarChart data={categoryData} />
                <PopularItemsBarChart data={popularItems} />
            </div>
        </div>
    );
};

export default Dashboard;
