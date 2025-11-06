import { requestBackend } from "../utils/requests";
import type { SkuSummary } from "../models/sku";

export async function getAllSkuSummaries(): Promise<SkuSummary[]> {
    const config = {
        method: "GET",
        url: "api/sku-summary",
        withCredentials: true,
    };
    const response = await requestBackend(config);
    return response.data;
}

