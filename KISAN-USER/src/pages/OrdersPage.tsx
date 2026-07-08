import { useEffect, useState } from 'react';
import { Order } from '../types';
import OrderCard from '../components/OrderCard';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { 
  Package, 
  Filter,
  Search, 
  RefreshCw, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  BarChart3,
  ChevronDown
} from 'lucide-react';

interface OrdersPageProps {
  onNavigate: (page: string) => void;
}

type OrderStatus = 'all' | 'pending' | 'payment_pending' | 'confirmed' | 'delivery' | 'completed' | 'rejected';
type SortOption = 'newest' | 'oldest' | 'price-high' | 'price-low';

export default function OrdersPage({ onNavigate }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days' | '90days'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadOrders();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, statusFilter, sortBy, dateRange]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.CUSTOMER_ORDERS(user.mobile));
      if (!response.ok) throw new Error('Failed to load orders');
      const data = await response.json();
      const processedOrders = data.map((order: any) => ({
        ...order,
        quantity: order.quantity && order.quantity > 0 ? order.quantity : 1,
        finalAmount: order.finalAmount || order.productPrice || 0,
        unit: order.unit || 'item',
        deliveryType: order.deliveryType || 'pickup',
        status: order.status || 'pending',
        paymentStatus: order.paymentStatus || 'pending'
      }));
      setOrders(processedOrders);
    } catch (error) {
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handlePaymentComplete = async (orderId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ORDERS}/${orderId}/process-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process payment');
      }
      const result = await response.json();
      showNotification(
        `Payment completed! ₹${result.revenue.amount} credited to farmer.`,
        'success'
      );
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status: result.order.status, paymentStatus: 'completed' }
            : order
        )
      );
      return result;
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Payment failed. Please try again.',
        'error'
      );
      throw error;
    }
  };

  const handleOrderUpdate = () => loadOrders();

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const response = await fetch(`${API_ENDPOINTS.ORDERS}/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: 'Cancelled by customer' })
      });
      if (!response.ok) throw new Error('Failed to cancel order');
      showNotification('Order cancelled successfully', 'success');
      await loadOrders();
    } catch {
      showNotification('Failed to cancel order', 'error');
    }
  };

  const handleContactFarmer = (order: Order) => showNotification(`Contacting farmer: ${order.farmerName}`, 'info');
  const handleTrackOrder = (order: Order) => showNotification(`Tracking order: ${order.productName}`, 'info');
  const handleRateOrder = (order: Order) => showNotification(`Rating order: ${order.productName}`, 'info');

  const filterAndSortOrders = () => {
    let filtered = [...orders];
    if (statusFilter !== 'all') filtered = filtered.filter(o => o.status === statusFilter);
    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (dateRange !== 'all') {
      const daysAgo = new Date();
      if (dateRange === '7days') daysAgo.setDate(daysAgo.getDate() - 7);
      if (dateRange === '30days') daysAgo.setDate(daysAgo.getDate() - 30);
      if (dateRange === '90days') daysAgo.setDate(daysAgo.getDate() - 90);
      filtered = filtered.filter(o => { try { return new Date(o.date) >= daysAgo; } catch { return true; } });
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'price-high': return (b.finalAmount || b.productPrice) - (a.finalAmount || a.productPrice);
        case 'price-low': return (a.finalAmount || a.productPrice) - (b.finalAmount || b.productPrice);
        default: return 0;
      }
    });
    setFilteredOrders(filtered);
  };

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const paymentPending = orders.filter(o => o.status === 'payment_pending').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const delivery = orders.filter(o => o.status === 'delivery').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const rejected = orders.filter(o => o.status === 'rejected').length;
    const totalAmount = orders.reduce((sum, o) => sum + ((o.finalAmount || o.productPrice || 0) * (o.quantity || 1)), 0);
    return { total, pending, paymentPending, confirmed, delivery, completed, rejected, totalAmount };
  };

  const stats = getOrderStats();

  const statusTabs = [
    { value: 'all' as OrderStatus, label: 'All', count: stats.total, icon: BarChart3 },
    { value: 'pending' as OrderStatus, label: 'Pending', count: stats.pending, icon: Clock },
    { value: 'payment_pending' as OrderStatus, label: 'Pay Due', count: stats.paymentPending, icon: DollarSign },
    { value: 'confirmed' as OrderStatus, label: 'Confirmed', count: stats.confirmed, icon: CheckCircle2 },
    { value: 'delivery' as OrderStatus, label: 'Delivery', count: stats.delivery, icon: Package },
    { value: 'completed' as OrderStatus, label: 'Done', count: stats.completed, icon: CheckCircle2 },
    { value: 'rejected' as OrderStatus, label: 'Cancelled', count: stats.rejected, icon: XCircle },
  ];

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateRange !== 'all';

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16 sm:py-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 px-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
              <Package className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-br from-gray-900 to-blue-900 bg-clip-text text-transparent mb-3 sm:mb-4">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-8 sm:mb-10 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
              Please sign in to view your order history, track deliveries, and manage your purchases
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => onNavigate('signin')}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Sign In to Continue
              </button>
              <button
                onClick={() => onNavigate('products')}
                className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-300"
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-lg">
                <Package className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-gray-900 to-blue-900 bg-clip-text text-transparent">
                My Orders
              </h1>
            </div>
            <p className="text-gray-500 text-xs sm:text-base ml-9 sm:ml-12">
              {stats.total} orders · ₹{stats.totalAmount.toLocaleString()} total
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 sm:px-6 sm:py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl sm:rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 disabled:opacity-50 text-sm sm:text-base font-medium"
          >
            <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Stats Grid — 2 cols on mobile, 4 on xl */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-7 shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Total Orders</p>
                <p className="text-2xl sm:text-4xl font-bold text-gray-900 leading-none mb-1">{stats.total}</p>
                <p className="text-blue-600 text-xs sm:text-sm font-semibold">
                  ₹{stats.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 sm:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Package className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-7 shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Active</p>
                <p className="text-2xl sm:text-4xl font-bold text-orange-600 leading-none mb-1">
                  {stats.pending + stats.paymentPending + stats.confirmed + stats.delivery}
                </p>
                <p className="text-gray-500 text-xs font-medium">In progress</p>
              </div>
              <div className="p-2.5 sm:p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-7 shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Pay Pending</p>
                <p className="text-2xl sm:text-4xl font-bold text-red-600 leading-none mb-1">{stats.paymentPending}</p>
                <p className="text-gray-500 text-xs font-medium">Awaiting</p>
              </div>
              <div className="p-2.5 sm:p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-7 shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Completed</p>
                <p className="text-2xl sm:text-4xl font-bold text-green-600 leading-none mb-1">{stats.completed}</p>
                <p className="text-gray-500 text-xs font-medium">Delivered</p>
              </div>
              <div className="p-2.5 sm:p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/50 mb-5 sm:mb-8">

          {/* Search + Filter toggle row */}
          <div className="p-3 sm:p-7 flex gap-2 sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 bg-white border border-gray-300 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
              />
            </div>

            {/* Mobile: toggle filters button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`sm:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-colors text-sm font-medium ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-600'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">!</span>
              )}
            </button>

            {/* Desktop: inline selects */}
            <div className="hidden sm:flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus)}
                className="px-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivery">Delivery</option>
                <option value="completed">Completed</option>
                <option value="rejected">Cancelled</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
          </div>

          {/* Mobile: collapsible filter panel */}
          {showFilters && (
            <div className="sm:hidden px-3 pb-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus)}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivery">Delivery</option>
                <option value="completed">Completed</option>
                <option value="rejected">Cancelled</option>
              </select>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="flex-1 px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-high">High Price</option>
                  <option value="price-low">Low Price</option>
                </select>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="flex-1 px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="7days">7 Days</option>
                  <option value="30days">30 Days</option>
                  <option value="90days">90 Days</option>
                </select>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={() => { setSearchTerm(''); setStatusFilter('all'); setDateRange('all'); }}
                  className="w-full py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Status Tabs — horizontally scrollable */}
          <div className="px-3 sm:px-7 pb-3 sm:pb-7 border-t border-gray-100 pt-3 sm:pt-0 sm:border-t-0">
            <div className="overflow-x-auto -mx-1 px-1">
              <div className="flex gap-1.5 sm:gap-2 min-w-max pt-1 sm:pt-6">
                {statusTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setStatusFilter(tab.value)}
                      className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all duration-300 text-xs sm:text-sm whitespace-nowrap ${
                        statusFilter === tab.value
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs leading-none ${
                        statusFilter === tab.value
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-16 sm:py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-14 sm:w-14 border-[3px] border-blue-600 border-t-transparent"></div>
            <p className="mt-5 text-gray-600 text-base sm:text-lg">Loading your orders...</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Please wait while we fetch your order history</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-3 sm:space-y-5">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onCancel={handleCancelOrder}
                onPaymentComplete={handlePaymentComplete}
                onTrack={handleTrackOrder}
                onContact={handleContactFarmer}
                onRate={handleRateOrder}
                onOrderUpdate={handleOrderUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 px-4">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-16 h-16 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-inner">
              <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              {hasActiveFilters ? 'No matching orders' : 'No orders yet'}
            </h3>
            <p className="text-gray-500 mb-8 sm:mb-10 text-sm sm:text-lg max-w-md mx-auto leading-relaxed">
              {hasActiveFilters
                ? 'Try adjusting your search or filter criteria.'
                : 'Start shopping and your orders will appear here.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => onNavigate('products')}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Browse Products
              </button>
              {hasActiveFilters && (
                <button
                  onClick={() => { setSearchTerm(''); setStatusFilter('all'); setDateRange('all'); }}
                  className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-300"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
