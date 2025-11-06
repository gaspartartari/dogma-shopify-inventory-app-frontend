export type ProductDetail = {
    productId: number;
    sku: string;
    skuName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export type OrderWithDetails = {
    orderId: number;
    orderNumber: string;
    numberRecurrence: number;
    paymentDate: string;
    updatedDate: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    subscriptionId: string;
    subscriptionStatus: string;
    subscriptionTotalRecurrences: number;
    subscriptionNextBillingDate: string;
    products: ProductDetail[];
}

export type RevenueDataPoint = {
    yearMonth: string;  // Format: "YYYY-MM"
    totalRevenue: number;
}

