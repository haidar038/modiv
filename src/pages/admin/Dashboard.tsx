import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FolderOpen, FileText, ClipboardList, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/formatCurrency";

interface DashboardStats {
  categoriesCount: number;
  itemsCount: number;
  templatesCount: number;
  inquiriesCount: number;
  pendingInquiries: number;
  totalRevenue: number;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoriesRes, itemsRes, templatesRes, inquiriesRes] = await Promise.all([
          supabase.from("categories").select("id", { count: "exact", head: true }),
          supabase.from("items").select("id", { count: "exact", head: true }),
          supabase.from("event_templates").select("id", { count: "exact", head: true }),
          supabase.from("inquiries").select("id, status, total"),
        ]);

        const inquiries = inquiriesRes.data || [];
        const pendingInquiries = inquiries.filter((i) => i.status === "pending").length;
        const totalRevenue = inquiries
          .filter((i) => i.status === "completed")
          .reduce((sum, i) => sum + Number(i.total || 0), 0);

        setStats({
          categoriesCount: categoriesRes.count || 0,
          itemsCount: itemsRes.count || 0,
          templatesCount: templatesRes.count || 0,
          inquiriesCount: inquiries.length,
          pendingInquiries,
          totalRevenue,
        });
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
      title: "Categories",
      value: stats.categoriesCount,
      icon: FolderOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Items",
      value: stats.itemsCount,
      icon: Package,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Templates",
      value: stats.templatesCount,
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Total Inquiries",
      value: stats.inquiriesCount,
      icon: ClipboardList,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the admin panel. Here's an overview of your event platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Pending Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {isLoading ? "..." : stats.pendingInquiries}
            </div>
            <p className="text-sm text-muted-foreground">
              Inquiries awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">
              {isLoading ? "..." : formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-sm text-muted-foreground">
              From completed inquiries
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
