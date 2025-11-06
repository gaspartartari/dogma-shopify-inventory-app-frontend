import { useState, useContext, useEffect, useCallback } from 'react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { ContextToken } from '../utils/context-token'
import * as authService from '../services/auth-service'
import { useNavigate } from 'react-router-dom'
import { getAllOrders } from '../services/order-service'
import { getRevenueOverTime } from '../services/revenue-service'
import { getAllSkuSummaries } from '../services/sku-service'
import type { OrderWithDetails, RevenueDataPoint } from '../models/order'
import type { SkuSummary } from '../models/sku'
import { toast } from 'react-toastify'
import { useQuery } from '@tanstack/react-query'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatsCards from '../components/dashboard/StatsCards'
import RevenueGraphSection from '../components/dashboard/RevenueGraphSection'
import OrdersGrid from '../components/dashboard/OrdersGrid'
import SkuGrid from '../components/dashboard/SkuGrid'

ModuleRegistry.registerModules([AllCommunityModule]);

function Dashboard() {
  const navigate = useNavigate();
  const { contextTokenPayload, setContextTokenPayload } = useContext(ContextToken);
  const [filteredOrders, setFilteredOrders] = useState<OrderWithDetails[]>([]);
  const [hasActiveSearch, setHasActiveSearch] = useState(false);

  // Date range state for revenue graph (default to last 90 days)
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Queries
  const { data: rowData = [], isLoading, refetch, isError, error } = useQuery<OrderWithDetails[], Error>({
    queryKey: ['orders'],
    queryFn: getAllOrders,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { 
    data: revenueData = [], 
    isLoading: isLoadingRevenue, 
    isError: isRevenueError
  } = useQuery<RevenueDataPoint[], Error>({
    queryKey: ['revenue', startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]],
    queryFn: () => getRevenueOverTime(
      startDate.toISOString().split('T')[0], 
      endDate.toISOString().split('T')[0]
    ),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { 
    data: skuData = [], 
    isLoading: isLoadingSku, 
    refetch: refetchSku,
    isError: isSkuError,
    error: skuError
  } = useQuery<SkuSummary[], Error>({
    queryKey: ['skuSummaries'],
    queryFn: getAllSkuSummaries,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Error handling
  useEffect(() => {
    if (isError && error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    }
  }, [isError, error]);

  useEffect(() => {
    if (isSkuError && skuError) {
      console.error('Erro ao buscar SKUs:', skuError);
      toast.error('Erro ao carregar SKUs');
    }
  }, [isSkuError, skuError]);

  // Handlers
  const handleLogout = () => {
    authService.logout();
    setContextTokenPayload(undefined);
    navigate('/login');
  }

  const handleFilteredDataChange = useCallback((filtered: OrderWithDetails[], searchText: string) => {
    setFilteredOrders(filtered);
    setHasActiveSearch(searchText.trim().length > 0);
  }, []);

  // Initialize filtered orders when data loads
  useEffect(() => {
    if (rowData.length > 0 && filteredOrders.length === 0) {
      setFilteredOrders(rowData);
    }
  }, [rowData, filteredOrders.length]);

  return (
    <div className="min-h-screen bg-bg-secondary">
      <DashboardHeader
        username={contextTokenPayload?.username}
        onLogout={handleLogout}
      />

      <main className="p-6">
        <StatsCards
          orders={rowData}
          filteredOrders={filteredOrders}
          hasActiveSearch={hasActiveSearch}
        />

        <RevenueGraphSection
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          data={revenueData}
          isLoading={isLoadingRevenue}
          isError={isRevenueError}
        />

        <OrdersGrid
          orders={rowData}
          isLoading={isLoading}
          isError={isError}
          onRefresh={refetch}
          onFilteredDataChange={handleFilteredDataChange}
        />

        <SkuGrid
          skus={skuData}
          isLoading={isLoadingSku}
          isError={isSkuError}
          onRefresh={refetchSku}
        />
      </main>
    </div>
  )
}

export default Dashboard
