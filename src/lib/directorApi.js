// src/lib/directorApi.js
// Typed API functions for Director Dashboard
import supabase from "./supabaseClient.js";

/**
 * @typedef {Object} StatusBreakdown
 * @property {string} status
 * @property {number} deal_count
 * @property {number} total_payout
 */

/**
 * @typedef {Object} StageAge
 * @property {string} status
 * @property {number} avg_age_days
 * @property {number} min_age_days
 * @property {number} max_age_days
 * @property {number} deal_count
 */

/**
 * @typedef {Object} MoneySummary
 * @property {number} total_payout_committed
 * @property {number} total_paid_to_date
 * @property {number} total_remaining
 * @property {number} avg_deal_size
 * @property {number} active_deals_count
 * @property {number} completed_deals_count
 */

/**
 * @typedef {Object} ComplianceSummary
 * @property {string} compliance_status
 * @property {number} deal_count
 * @property {number} percentage
 */

/**
 * @typedef {Object} WeeklyDeals
 * @property {string} week_start
 * @property {number} deal_count
 * @property {number} total_payout
 */

/**
 * @typedef {Object} TimelineData
 * @property {string} period
 * @property {number} cumulative_committed
 * @property {number} cumulative_paid
 */

/**
 * @typedef {Object} Deal
 * @property {string} id
 * @property {string} org_id
 * @property {string} deal_name
 * @property {string} athlete_id
 * @property {string} athlete_name
 * @property {string} brand_id
 * @property {string} brand_name
 * @property {string} status
 * @property {number} payout_amount
 * @property {number} paid_to_date
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} completed_at
 * @property {string} stage
 * @property {number} age_days
 * @property {string} compliance_status
 * @property {string} compliance_notes
 * @property {Object} metadata
 */

/**
 * Get deal status breakdown
 * @param {string} orgId
 * @param {string} [startDate]
 * @param {string} [endDate]
 * @returns {Promise<StatusBreakdown[]>}
 */
export async function getStatusBreakdown(orgId, startDate = null, endDate = null) {
  if (!orgId) throw new Error("Organization ID is required");

  const { data, error } = await supabase.rpc("org_deal_status_breakdown", {
    p_org_id: orgId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw new Error(`Failed to fetch status breakdown: ${error.message}`);
  return data || [];
}

/**
 * Get stage age statistics
 * @param {string} orgId
 * @param {string} [startDate]
 * @param {string} [endDate]
 * @returns {Promise<StageAge[]>}
 */
export async function getStageAge(orgId, startDate = null, endDate = null) {
  if (!orgId) throw new Error("Organization ID is required");

  const { data, error } = await supabase.rpc("org_stage_age_days", {
    p_org_id: orgId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw new Error(`Failed to fetch stage age: ${error.message}`);
  return data || [];
}

/**
 * Get money summary
 * @param {string} orgId
 * @param {string} [startDate]
 * @param {string} [endDate]
 * @returns {Promise<MoneySummary>}
 */
export async function getMoneySummary(orgId, startDate = null, endDate = null) {
  if (!orgId) throw new Error("Organization ID is required");

  const { data, error } = await supabase.rpc("org_money_summary", {
    p_org_id: orgId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw new Error(`Failed to fetch money summary: ${error.message}`);
  return data?.[0] || {
    total_payout_committed: 0,
    total_paid_to_date: 0,
    total_remaining: 0,
    avg_deal_size: 0,
    active_deals_count: 0,
    completed_deals_count: 0,
  };
}

/**
 * Get compliance summary
 * @param {string} orgId
 * @param {string} [startDate]
 * @param {string} [endDate]
 * @returns {Promise<ComplianceSummary[]>}
 */
export async function getComplianceSummary(orgId, startDate = null, endDate = null) {
  if (!orgId) throw new Error("Organization ID is required");

  const { data, error } = await supabase.rpc("org_compliance_summary", {
    p_org_id: orgId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw new Error(`Failed to fetch compliance summary: ${error.message}`);
  return data || [];
}

/**
 * Get deals per week
 * @param {string} orgId
 * @param {string} [startDate]
 * @param {string} [endDate]
 * @returns {Promise<WeeklyDeals[]>}
 */
export async function getDealsPerWeek(orgId, startDate = null, endDate = null) {
  if (!orgId) throw new Error("Organization ID is required");

  const { data, error } = await supabase.rpc("org_deals_per_week", {
    p_org_id: orgId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw new Error(`Failed to fetch deals per week: ${error.message}`);
  return data || [];
}

/**
 * Get committed vs paid timeline
 * @param {string} orgId
 * @param {string} [startDate]
 * @param {string} [endDate]
 * @returns {Promise<TimelineData[]>}
 */
export async function getCommittedVsPaidTimeline(orgId, startDate = null, endDate = null) {
  if (!orgId) throw new Error("Organization ID is required");

  const { data, error } = await supabase.rpc("org_committed_vs_paid_timeline", {
    p_org_id: orgId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw new Error(`Failed to fetch timeline: ${error.message}`);
  return data || [];
}

/**
 * Get paginated deals with filters
 * @param {string} orgId
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.pageSize
 * @param {string} [options.status]
 * @param {string} [options.athlete]
 * @param {string} [options.brand]
 * @param {string} [options.startDate]
 * @param {string} [options.endDate]
 * @param {string} [options.sortBy]
 * @param {boolean} [options.sortDesc]
 * @returns {Promise<{data: Deal[], count: number}>}
 */
export async function getDeals(orgId, options = {}) {
  if (!orgId) throw new Error("Organization ID is required");

  const {
    page = 1,
    pageSize = 20,
    status = null,
    athlete = null,
    brand = null,
    startDate = null,
    endDate = null,
    sortBy = "created_at",
    sortDesc = true,
  } = options;

  let query = supabase
    .from("deal_fact")
    .select("*", { count: "exact" })
    .eq("org_id", orgId);

  // Apply filters
  if (status) query = query.eq("status", status);
  if (athlete) query = query.ilike("athlete_name", `%${athlete}%`);
  if (brand) query = query.ilike("brand_name", `%${brand}%`);
  if (startDate) query = query.gte("created_at", startDate);
  if (endDate) query = query.lte("created_at", endDate);

  // Apply sorting
  query = query.order(sortBy, { ascending: !sortDesc });

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch deals: ${error.message}`);

  return { data: data || [], count: count || 0 };
}

/**
 * Get single deal by ID
 * @param {string} dealId
 * @returns {Promise<Deal>}
 */
export async function getDealById(dealId) {
  if (!dealId) throw new Error("Deal ID is required");

  const { data, error } = await supabase
    .from("deal_fact")
    .select("*")
    .eq("id", dealId)
    .single();

  if (error) throw new Error(`Failed to fetch deal: ${error.message}`);
  return data;
}

/**
 * Export deals to CSV and upload to storage
 * @param {string} orgId
 * @param {Object} filters
 * @returns {Promise<{url: string, path: string}>}
 */
export async function exportDealsToCsv(orgId, filters = {}) {
  if (!orgId) throw new Error("Organization ID is required");

  // Fetch all deals matching filters (no pagination)
  let query = supabase
    .from("deal_fact")
    .select("*")
    .eq("org_id", orgId);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.athlete) query = query.ilike("athlete_name", `%${filters.athlete}%`);
  if (filters.brand) query = query.ilike("brand_name", `%${filters.brand}%`);
  if (filters.startDate) query = query.gte("created_at", filters.startDate);
  if (filters.endDate) query = query.lte("created_at", filters.endDate);

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch deals for export: ${error.message}`);

  // Generate CSV
  const csv = generateCsv(data || []);

  // Upload to storage
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `deals-export-${timestamp}.csv`;
  const path = `exports/${orgId}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("director-exports")
    .upload(path, csv, {
      contentType: "text/csv",
      upsert: false,
    });

  if (uploadError) throw new Error(`Failed to upload CSV: ${uploadError.message}`);

  // Get signed URL (valid for 1 hour)
  const { data: urlData, error: urlError } = await supabase.storage
    .from("director-exports")
    .createSignedUrl(path, 3600);

  if (urlError) throw new Error(`Failed to create signed URL: ${urlError.message}`);

  return { url: urlData.signedUrl, path };
}

/**
 * Generate CSV from deals data
 * @private
 * @param {Deal[]} deals
 * @returns {string}
 */
function generateCsv(deals) {
  const headers = [
    "Deal Name",
    "Athlete",
    "Brand",
    "Status",
    "Payout Amount",
    "Paid To Date",
    "Remaining",
    "Created At",
    "Age (Days)",
    "Compliance Status",
    "Compliance Notes",
  ];

  const rows = deals.map((deal) => [
    deal.deal_name || "",
    deal.athlete_name || "",
    deal.brand_name || "",
    deal.status || "",
    deal.payout_amount || 0,
    deal.paid_to_date || 0,
    (deal.payout_amount || 0) - (deal.paid_to_date || 0),
    deal.created_at || "",
    deal.age_days || 0,
    deal.compliance_status || "",
    (deal.compliance_notes || "").replace(/"/g, '""'), // Escape quotes
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          if (typeof cell === "string" && (cell.includes(",") || cell.includes('"') || cell.includes("\n"))) {
            return `"${cell}"`;
          }
          return cell;
        })
        .join(",")
    ),
  ].join("\n");

  return csvContent;
}

/**
 * Get open violations count
 * @param {string} orgId
 * @returns {Promise<number>}
 */
export async function getOpenViolationsCount(orgId) {
  if (!orgId) throw new Error("Organization ID is required");

  const { count, error } = await supabase
    .from("deal_fact")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("compliance_status", "violation");

  if (error) throw new Error(`Failed to fetch violations count: ${error.message}`);
  return count || 0;
}
