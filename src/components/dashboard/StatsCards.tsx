import { useMemo } from 'react'

import { faShoppingCart, faCubes, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons"
import StatsCard from './StatsCard'
import type { OrderWithDetails } from '../../models/order'

type StatsCardsProps = {
  orders: OrderWithDetails[]
  filteredOrders: OrderWithDetails[]
  hasActiveSearch: boolean
}

export default function StatsCards({ orders, filteredOrders, hasActiveSearch }: StatsCardsProps) {
  // Calculate total revenue from filtered orders
  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, order) => {
      const orderTotal = order.products?.reduce((orderSum, product) => {
        return orderSum + (product.totalPrice || 0);
      }, 0) || 0;
      return sum + orderTotal;
    }, 0);
  }, [filteredOrders]);

  // Calculate total units from filtered orders
  const totalUnits = useMemo(() => {
    return filteredOrders.reduce((sum, order) => {
      const orderUnits = order.products?.reduce((unitSum, product) => {
        return unitSum + (product.quantity || 0);
      }, 0) || 0;
      return sum + orderUnits;
    }, 0);
  }, [filteredOrders]);

  // Calculate total units from all orders for secondary display
  const allOrdersUnits = useMemo(() => {
    return orders.reduce((sum, order) =>
      sum + (order.products?.reduce((pSum, p) => pSum + p.quantity, 0) || 0), 0
    );
  }, [orders]);

  const formattedRevenue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(totalRevenue);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatsCard
        title={hasActiveSearch ? 'Pedidos Filtrados' : 'Total de Pedidos'}
        value={filteredOrders.length}
        secondaryValue={hasActiveSearch && orders.length !== filteredOrders.length ? `/ ${orders.length}` : undefined}
        icon={faShoppingCart}
        toolTip="Total de pedidos aguardando pagamento que possuem SKU controlado"
      />
      <StatsCard
        title={hasActiveSearch ? 'Unidades Filtradas' : 'Total de Unidades'}
        value={totalUnits}
        secondaryValue={hasActiveSearch ? `/ ${allOrdersUnits}` : undefined}
        icon={faCubes}
        toolTip="Total de SKU controlado no estoque reservado"

      />
      <StatsCard
        title={hasActiveSearch ? 'Receita Prevista Filtrada' : 'Receita Prevista'}
        value={formattedRevenue}
        icon={faMoneyBillWave}
        toolTip= "Receita total prevista dos SKUs controlados nos pedidos"

      />
    </div>
  )
}


