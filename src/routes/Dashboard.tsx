import { useState, useContext, useEffect, useCallback, useMemo } from 'react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { ContextToken } from '../utils/context-token'
import * as authService from '../services/auth-service'
import { useNavigate } from 'react-router-dom'
import { getAllOrders } from '../services/order-service'
import { getRevenueOverTime } from '../services/revenue-service'
import type { OrderWithDetails, RevenueDataPoint } from '../models/order'
import { toast } from 'react-toastify'
import { useQuery } from '@tanstack/react-query'
import { getOrdersWithReservedStock } from '../utils/inventory-status'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatsCards from '../components/dashboard/StatsCards'
import RevenueGraphSection from '../components/dashboard/RevenueGraphSection'
import OrdersGrid from '../components/dashboard/OrdersGrid'
import SkuGrid from '../components/dashboard/SkuGrid'

ModuleRegistry.registerModules([AllCommunityModule]);

function Dashboard() {
  const navigate = useNavigate();
  const { contextTokenPayload, setContextTokenPayload } = useContext(ContextToken);

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

  // Calculate reserved stock orders from all orders
  const reservedStockOrders = useMemo(() => {
    return getOrdersWithReservedStock(rowData);
  }, [rowData]);

  // Error handling
  useEffect(() => {
    if (isError && error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    }
  }, [isError, error]);


  // Handlers
  const handleLogout = () => {
    authService.logout();
    setContextTokenPayload(undefined);
    navigate('/login');
  }

  const handleFilteredDataChange = useCallback((filtered: OrderWithDetails[], searchText: string) => {
    // Callback for search functionality within OrdersGrid
    // No need to store state since we're only showing reserved stock orders
  }, []);

  return (
    <div className="min-h-screen bg-bg-secondary">
      <DashboardHeader
        username={contextTokenPayload?.username}
        onLogout={handleLogout}
      />

      <main className="p-6">
        <StatsCards
          reservedStockOrders={reservedStockOrders}
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
          orders={reservedStockOrders}
          isLoading={isLoading}
          isError={isError}
          onRefresh={refetch}
          onFilteredDataChange={handleFilteredDataChange}
        />

        <SkuGrid
          reservedStockOrders={reservedStockOrders}
          isLoading={isLoading}
          isError={isError}
          onRefresh={refetch}
        />
      </main>
    </div>
  )
}

export default Dashboard
