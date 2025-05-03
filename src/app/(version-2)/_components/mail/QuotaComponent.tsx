"use client";

import React, { useEffect, useState } from 'react';
import SidebarStroageView from './SidebarStroageView';
 
import { ApiResponse } from '@/lib/types';
import { StorageUsageSkeleton } from './StorageUsageSkelton';
import { API } from '@/lib/api/handler';
import { AxiosResponse } from 'axios';
import { useMailStore } from "@/store/mails"
import { QuotaResponse } from '@/lib/types/interfaces/QuotaResponse';

const QuotaComponent = () => {
    const { quota, setQuota } = useMailStore();
    const [loading, setLoading] = useState(!quota);
    const fetchQuota = async () => {
        try {
            
            const { data } = await API.getQuota() as AxiosResponse<ApiResponse<QuotaResponse>>;
            if (data.success && data.result) {
                setQuota(data.result);
            }
        } catch (error) {
            console.error("Failed to fetch quota:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!quota) {
            fetchQuota();
        } else {
            setLoading(false);
        }
    }, [quota, setQuota]);

    if (loading) {
        return <StorageUsageSkeleton />;
    }

    return quota !== null ? (
        <SidebarStroageView total={Number(quota?.storage.limit)} used={Number(quota?.storage.usage)} />
    ) : <StorageUsageSkeleton />;
};

export default QuotaComponent;
