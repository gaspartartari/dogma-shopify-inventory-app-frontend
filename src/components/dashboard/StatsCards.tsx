import { useMemo } from 'react'

import { faShoppingCart, faCubes, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons"
import StatsCard from './StatsCard'
import type { OrderWithDetails } from '../../models/order'

type StatsCardsProps = {
  reservedStockOrders: OrderWithDetails[]
}

export default function StatsCards({ reservedStockOrders }: StatsCardsProps) {
  // Calculate total revenue from reserved stock orders
  const totalRevenue = useMemo(() => {
    return reservedStockOrders.reduce((sum, order) => {
      const orderTotal = order.products?.reduce((orderSum, product) => {
        return orderSum + (product.totalPrice || 0);
      }, 0) || 0;
      return sum + orderTotal;
    }, 0);
  }, [reservedStockOrders]);

  // Calculate total units from reserved stock orders
  const totalUnits = useMemo(() => {
    return reservedStockOrders.reduce((sum, order) => {
      const orderUnits = order.products?.reduce((unitSum, product) => {
        return unitSum + (product.quantity || 0);
      }, 0) || 0;
      return sum + orderUnits;
    }, 0);
  }, [reservedStockOrders]);

  const formattedRevenue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(totalRevenue);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatsCard
        title="Total de Pedidos com Estoque Reservado"
        value={reservedStockOrders.length}
        icon={faShoppingCart}
        toolTip="Total de pedidos que possuem estoque reservado (últimas 2 recorrências não pagas)"
      />
      <StatsCard
        title="Total de Unidades Reservadas"
        value={totalUnits}
        icon={faCubes}
        toolTip="Total de unidades de SKUs controlados em estoque reservado"
      />
      <StatsCard
        title="Valor Total Reservado"
        value={formattedRevenue}
        icon={faMoneyBillWave}
        toolTip="Valor total dos pedidos com estoque reservado"
      />
    </div>
  )
}


