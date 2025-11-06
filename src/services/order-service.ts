import { requestBackend } from "../utils/requests";
import type { OrderWithDetails } from "../models/order";

export async function getAllOrders(): Promise<OrderWithDetails[]> {
    const response = await requestBackend({
        method: "GET",
        url: "/api/orders",
        withCredentials: true
    });
    return response.data;
}

