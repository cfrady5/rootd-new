// src/lib/api/directorComplete.js
// Complete API layer for Director Dashboard with all 13 RPCs + helpers
import supabase from '../supabaseClient.js';

// =============================================
// Original 6 RPCs (from directorApi.js)
// =============================================

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

// =============================================
// New 7 RPCs (extended functionality)
// =============================================

export async function getBrandBreakdown(orgId, startDate = null, endDate = null) {
  if (!orgId) throw new Error("Organization ID is required");
  const { data, error } = await supabase.rpc("org_brand_breakdown", {
    p_org_id: orgId,
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) throw new Error(`Failed to fetch brand breakdown: ${error.message}`);
  return data || [];
}

export async function getAthleteRollup(orgId, startDate = null, endDate = null) {
  if (!orgId) throw new Error("Organization ID is required");
  const { data, error } = await supabase.rpc("org_athlete_rollup", {
    p_org_id: orgId,
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) throw new Error(`Failed to fetch athlete rollup: ${error.message}`);
  return data || [];
}

export async function getComplianceDetails(orgId, status = null) {
  if (!orgId) throw new Error("Organization ID is required");
  const { data, error } = await supabase.rpc("org_compliance_details", {
    p_org_id: orgId,
    p_status: status,
  });
  if (error) throw new Error(`Failed to fetch compliance details: ${error.message}`);
  return data || [];
}

export async function getTopPerformers(orgId, startDate = null, endDate = null, limit = 10) {
  if (!orgId) throw new Error("Organization ID is required");
  const { data, error } = await supabase.rpc("org_top_performers", {
    p_org_id: orgId,
    p_start_date: startDate,
    p_end_date: endDate,
    p_limit: limit,
  });
  if (error) throw new Error(`Failed to fetch top performers: ${error.message}`);
  return data || [];
}

export async function getDealInsights(orgId) {
  if (!orgId) throw new Error("Organization ID is required");
  const { data, error } = await supabase.rpc("org_deal_insights", {
    p_org_id: orgId,
  });
  if (error) throw new Error(`Failed to fetch deal insights: ${error.message}`);
  return data || [];
}

export async function getDealMessages(dealId, limit = 50) {
  if (!dealId) throw new Error("Deal ID is required");
  const { data, error } = await supabase.rpc("org_deal_messages_for_deal", {
    p_deal_id: dealId,
    p_limit: limit,
  });
  if (error) throw new Error(`Failed to fetch deal messages: ${error.message}`);
  return data || [];
}

export async function getDealTasks(dealId) {
  if (!dealId) throw new Error("Deal ID is required");
  const { data, error } = await supabase.rpc("org_deal_tasks_for_deal", {
    p_deal_id: dealId,
  });
  if (error) throw new Error(`Failed to fetch deal tasks: ${error.message}`);
  return data || [];
}

// =============================================
// Direct table queries (paginated)
// =============================================

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

  if (status) query = query.eq("status", status);
  if (athlete) query = query.ilike("athlete_name", `%${athlete}%`);
  if (brand) query = query.ilike("brand_name", `%${brand}%`);
  if (startDate) query = query.gte("created_at", startDate);
  if (endDate) query = query.lte("created_at", endDate);

  query = query.order(sortBy, { ascending: !sortDesc });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch deals: ${error.message}`);

  return { data: data || [], count: count || 0 };
}

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

export async function getOrgMembers(orgId) {
  if (!orgId) throw new Error("Organization ID is required");

  const { data, error } = await supabase
    .from("org_members")
    .select(`
      *,
      profile:profiles(id, full_name, email, avatar_url)
    `)
    .eq("org_id", orgId)
    .order("joined_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch org members: ${error.message}`);
  return data || [];
}

export async function getNotifications(userId, unreadOnly = false) {
  if (!userId) throw new Error("User ID is required");

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (unreadOnly) {
    query = query.is("read_at", null);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);
  return data || [];
}

export async function getAuditLog(orgId, options = {}) {
  if (!orgId) throw new Error("Organization ID is required");

  const {
    page = 1,
    pageSize = 50,
    action = null,
    userId = null,
  } = options;

  let query = supabase
    .from("audit_log")
    .select("*", { count: "exact" })
    .eq("org_id", orgId);

  if (action) query = query.eq("action", action);
  if (userId) query = query.eq("user_id", userId);

  query = query.order("created_at", { ascending: false });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch audit log: ${error.message}`);

  return { data: data || [], count: count || 0 };
}

// =============================================
// Write operations (create/update/delete)
// =============================================

export async function createDealMessage(dealId, orgId, content, attachments = []) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("deal_messages")
    .insert({
      deal_id: dealId,
      org_id: orgId,
      author_id: user.id,
      author_name: user.user_metadata?.full_name || user.email,
      content,
      attachments,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create message: ${error.message}`);
  return data;
}

export async function createDealTask(dealId, orgId, taskData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("deal_tasks")
    .insert({
      deal_id: dealId,
      org_id: orgId,
      created_by: user.id,
      ...taskData,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create task: ${error.message}`);
  
  // Log to audit
  await logAudit(orgId, 'task_created', 'deal_task', data.id, {
    task_title: taskData.title,
    deal_id: dealId,
  });

  return data;
}

export async function updateDealTask(taskId, updates) {
  const { data, error } = await supabase
    .from("deal_tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update task: ${error.message}`);
  
  // Log to audit if status changed
  if (updates.status === 'completed') {
    await logAudit(data.org_id, 'task_completed', 'deal_task', taskId, {
      task_title: data.title,
    });
  }

  return data;
}

export async function markNotificationRead(notificationId) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .select()
    .single();

  if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
  return data;
}

export async function dismissInsight(userId, insightKey) {
  const { data, error } = await supabase
    .from("user_insights")
    .upsert({
      user_id: userId,
      insight_key: insightKey,
      dismissed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to dismiss insight: ${error.message}`);
  return data;
}

export async function updateAthleteCompliance(athleteId, updates) {
  const { data, error } = await supabase
    .from("athlete_compliance_profiles")
    .update(updates)
    .eq("athlete_id", athleteId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update athlete compliance: ${error.message}`);
  
  // Log to audit
  await logAudit(data.org_id, 'compliance_updated', 'athlete_compliance', athleteId, updates);

  return data;
}

export async function createOrgMember(orgId, userId, role) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("org_members")
    .insert({
      org_id: orgId,
      user_id: userId,
      role,
      invited_by: user.id,
      joined_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create org member: ${error.message}`);
  
  // Log to audit
  await logAudit(orgId, 'member_added', 'org_member', data.id, {
    role,
    invited_user_id: userId,
  });

  return data;
}

export async function updateOrgMemberRole(memberId, role) {
  const { data, error } = await supabase
    .from("org_members")
    .update({ role })
    .eq("id", memberId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update member role: ${error.message}`);
  
  // Log to audit
  await logAudit(data.org_id, 'member_role_changed', 'org_member', memberId, {
    new_role: role,
  });

  return data;
}

// =============================================
// CSV Export functionality
// =============================================

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
    (deal.compliance_notes || "").replace(/"/g, '""'),
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

// =============================================
// Helper functions
// =============================================

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

async function logAudit(orgId, action, subjectType, subjectId, meta = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase
    .from("audit_log")
    .insert({
      org_id: orgId,
      user_id: user?.id || null,
      action,
      subject_type: subjectType,
      subject_id: subjectId,
      meta,
    });
}

export async function uploadAttachment(file, dealId) {
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name}`;
  const path = `deal-attachments/${dealId}/${filename}`;

  const { error } = await supabase.storage
    .from("deal-attachments")
    .upload(path, file);

  if (error) throw new Error(`Failed to upload file: ${error.message}`);

  const { data: urlData } = await supabase.storage
    .from("deal-attachments")
    .createSignedUrl(path, 3600 * 24 * 7); // 7 days

  return {
    filename: file.name,
    path,
    url: urlData.signedUrl,
    size: file.size,
    type: file.type,
  };
}
