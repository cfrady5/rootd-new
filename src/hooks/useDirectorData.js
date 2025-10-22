// src/hooks/useDirectorData.js
import useSWR from 'swr';
import {
  getStatusBreakdown,
  getStageAge,
  getMoneySummary,
  getComplianceSummary,
  getDealsPerWeek,
  getCommittedVsPaidTimeline,
  getDeals,
  getOpenViolationsCount,
} from '../lib/directorApi.js';

// SWR configuration - 5 minute cache
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5 * 60 * 1000, // 5 minutes
};

/**
 * Hook to fetch all director dashboard data
 * @param {string} orgId - Organization ID
 * @param {Object} filters - Date range and other filters
 * @returns {Object} Dashboard data and loading states
 */
export function useDirectorDashboard(orgId, filters = {}) {
  const { startDate, endDate } = filters;

  // Fetch all data in parallel using SWR
  const { data: statusData, error: statusError } = useSWR(
    orgId ? ['statusBreakdown', orgId, startDate, endDate] : null,
    () => getStatusBreakdown(orgId, startDate, endDate),
    swrConfig
  );

  const { data: stageAgeData, error: stageAgeError } = useSWR(
    orgId ? ['stageAge', orgId, startDate, endDate] : null,
    () => getStageAge(orgId, startDate, endDate),
    swrConfig
  );

  const { data: moneySummary, error: moneyError } = useSWR(
    orgId ? ['moneySummary', orgId, startDate, endDate] : null,
    () => getMoneySummary(orgId, startDate, endDate),
    swrConfig
  );

  const { data: complianceData, error: complianceError } = useSWR(
    orgId ? ['compliance', orgId, startDate, endDate] : null,
    () => getComplianceSummary(orgId, startDate, endDate),
    swrConfig
  );

  const { data: weeklyData, error: weeklyError } = useSWR(
    orgId ? ['weekly', orgId, startDate, endDate] : null,
    () => getDealsPerWeek(orgId, startDate, endDate),
    swrConfig
  );

  const { data: timelineData, error: timelineError } = useSWR(
    orgId ? ['timeline', orgId, startDate, endDate] : null,
    () => getCommittedVsPaidTimeline(orgId, startDate, endDate),
    swrConfig
  );

  const { data: violationsCount, error: violationsError } = useSWR(
    orgId ? ['violations', orgId] : null,
    () => getOpenViolationsCount(orgId),
    swrConfig
  );

  const loading =
    !statusData &&
    !stageAgeData &&
    !moneySummary &&
    !complianceData &&
    !weeklyData &&
    !timelineData &&
    !violationsCount;

  const error =
    statusError ||
    stageAgeError ||
    moneyError ||
    complianceError ||
    weeklyError ||
    timelineError ||
    violationsError;

  return {
    statusBreakdown: statusData || [],
    stageAge: stageAgeData || [],
    moneySummary: moneySummary || {},
    compliance: complianceData || [],
    weeklyDeals: weeklyData || [],
    timeline: timelineData || [],
    violationsCount: violationsCount || 0,
    loading,
    error,
  };
}

/**
 * Hook to fetch paginated deals
 * @param {string} orgId - Organization ID
 * @param {Object} options - Pagination and filter options
 * @returns {Object} Deals data, count, and loading state
 */
export function useDeals(orgId, options = {}) {
  const key = orgId ? ['deals', orgId, JSON.stringify(options)] : null;

  const { data, error, mutate } = useSWR(
    key,
    () => getDeals(orgId, options),
    {
      ...swrConfig,
      revalidateOnFocus: true, // Revalidate deals more frequently
    }
  );

  return {
    deals: data?.data || [],
    totalCount: data?.count || 0,
    loading: !data && !error,
    error,
    refresh: mutate,
  };
}
