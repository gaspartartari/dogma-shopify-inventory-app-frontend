import { requestBackend } from "../utils/requests";
import type { ControlledSku } from "../models/controlled-sku";

export async function getAllControlledSkus(): Promise<ControlledSku[]> {
    const config = {
        method: "GET",
        url: "api/controlled-skus",
        withCredentials: true,
    };
    const response = await requestBackend(config);
    return response.data;
}

export async function getControlledSku(sku: string): Promise<ControlledSku> {
    const config = {
        method: "GET",
        url: `api/controlled-skus/${encodeURIComponent(sku)}`,
        withCredentials: true,
    };
    const response = await requestBackend(config);
    return response.data;
}

export async function createControlledSku(data: ControlledSku): Promise<ControlledSku> {
    const config = {
        method: "POST",
        url: "api/controlled-skus",
        data,
        withCredentials: true,
    };
    const response = await requestBackend(config);
    return response.data;
}

export async function updateControlledSku(sku: string, data: ControlledSku): Promise<ControlledSku> {
    const config = {
        method: "PUT",
        url: `api/controlled-skus/${encodeURIComponent(sku)}`,
        data,
        withCredentials: true,
    };
    const response = await requestBackend(config);
    return response.data;
}

export async function deleteControlledSku(sku: string): Promise<void> {
    const config = {
        method: "DELETE",
        url: `api/controlled-skus/${encodeURIComponent(sku)}`,
        withCredentials: true,
    };
    await requestBackend(config);
}

