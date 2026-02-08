import type { OrderWithDetails } from '../models/order'

/**
 * Determines if an order is in the last 2 recurrences of its subscription.
 * Groups orders by subscriptionId, sorts by numberRecurrence descending,
 * and checks if the order is in the first 2 (highest numbers).
 */
export function isInLastTwoRecurrences(
  order: OrderWithDetails,
  allOrders: OrderWithDetails[]
): boolean {
  if (!order.subscriptionId || order.numberRecurrence == null) {
    return false;
  }

  // Group orders by subscription
  const subscriptionOrders = allOrders.filter(
    o => o.subscriptionId === order.subscriptionId && o.numberRecurrence != null
  );

  if (subscriptionOrders.length === 0) {
    return false;
  }

  // Sort by numberRecurrence descending (highest first)
  const sorted = [...subscriptionOrders].sort((a, b) => 
    (b.numberRecurrence ?? 0) - (a.numberRecurrence ?? 0)
  );

  // Get last 2 recurrences (highest numbers)
  const lastTwo = sorted.slice(0, 2);

  // Check if this order is in the last 2
  return lastTwo.some(o => o.orderId === order.orderId);
}

/**
 * Determines if an order has reserved stock.
 * An order has reserved stock if:
 * 1. stockReleased === false
 * 2. paymentDate === null (unpaid)
 * 3. Order is in the last 2 recurrences of its subscription
 */
export function hasReservedStock(
  order: OrderWithDetails,
  allOrders: OrderWithDetails[]
): boolean {
  // Must not have stock released
  if (order.stockReleased === true) {
    return false;
  }

  // Must be unpaid
  if (order.paymentDate != null && order.paymentDate.trim() !== '') {
    return false;
  }

  // Must be in last 2 recurrences
  return isInLastTwoRecurrences(order, allOrders);
}

/**
 * Filters orders to only those with reserved stock.
 */
export function getOrdersWithReservedStock(
  orders: OrderWithDetails[]
): OrderWithDetails[] {
  return orders.filter(order => hasReservedStock(order, orders));
}
