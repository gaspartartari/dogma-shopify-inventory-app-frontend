import { requestBackend } from "../utils/requests";
import type { RevenueDataPoint } from "../models/order";

export async function getRevenueOverTime(startDate?: string, endDate?: string): Promise<RevenueDataPoint[]> {
    const params: Record<string, string> = {};
    
    if (startDate) {
        params.startDate = startDate;
    }
    
    if (endDate) {
        params.endDate = endDate;
    }
    
    const config = {
        method: "GET",
        url: "/api/revenue/over-time",
        params,
        withCredentials: true,
    };
    
    const response = await requestBackend(config);
    return response.data;
}

