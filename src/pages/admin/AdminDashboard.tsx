import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, FileText, Calendar, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { dashboardApi, DashboardStats, QuoteRecord, BookingRecord } from '@/services/supabaseService';
import { products } from '@/data/products';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const result = await dashboardApi.getStats();
    if (result.success && result.data) {
      setStats(result.data);
    } else {
      // Fallback to mock data for demo
      setStats({
        totalProducts: products.length,
        pendingQuotes: 0,
        pendingBookings: 0,
        unreadContacts: 0,
        recentQuotes: [],
        recentBookings: [],
      });
    }
    setIsLoading(false);
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Pending Quotes',
      value: stats?.pendingQuotes || 0,
      icon: FileText,
      color: 'text-amber-600 bg-amber-100',
    },
    {
      title: 'Pending Bookings',
      value: stats?.pendingBookings || 0,
      icon: Calendar,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Unread Messages',
      value: stats?.unreadContacts || 0,
      icon: MessageSquare,
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to CoolTech Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      {isLoading ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                      ) : (
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      )}
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Quotes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Quotes</CardTitle>
              <a href="/admin/quotes" className="text-sm text-primary hover:underline">
                View all
              </a>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : stats?.recentQuotes?.length ? (
                <div className="space-y-3">
                  {stats.recentQuotes.slice(0, 5).map((quote) => (
                    <div
                      key={quote.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{quote.name}</p>
                        <p className="text-xs text-muted-foreground">{quote.email}</p>
                      </div>
                      <Badge variant={quote.status === 'pending' ? 'secondary' : 'default'}>
                        {quote.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent quotes</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
              <a href="/admin/bookings" className="text-sm text-primary hover:underline">
                View all
              </a>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : stats?.recentBookings?.length ? (
                <div className="space-y-3">
                  {stats.recentBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{booking.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.preferred_date} at {booking.preferred_time}
                        </p>
                      </div>
                      <Badge variant={booking.status === 'pending' ? 'secondary' : 'default'}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent bookings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <a
                href="/admin/products?action=new"
                className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <Package className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Add Product</span>
              </a>
              <a
                href="/admin/quotes"
                className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">View Quotes</span>
              </a>
              <a
                href="/admin/bookings"
                className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <Calendar className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">View Bookings</span>
              </a>
              <a
                href="/"
                target="_blank"
                className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <TrendingUp className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">View Site</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
