import { hasSupabase, supabase } from "./supabase";
import { seedEvents } from "./demoData";

const EVENTS_KEY = "eventra-events";
const REG_KEY = "eventra-registrations";
const ATTENDANCE_KEY = "eventra-attendance";

function getLocalEvents() {
  const raw = localStorage.getItem(EVENTS_KEY);
  if (!raw) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(seedEvents));
    return seedEvents;
  }
  return JSON.parse(raw);
}

function getLocalRegistrations() {
  const raw = localStorage.getItem(REG_KEY);
  if (!raw) {
    localStorage.setItem(REG_KEY, JSON.stringify([]));
    return [];
  }
  return JSON.parse(raw);
}

function setLocalRegistrations(next) {
  localStorage.setItem(REG_KEY, JSON.stringify(next));
}

function getLocalAttendance() {
  const raw = localStorage.getItem(ATTENDANCE_KEY);
  if (!raw) {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([]));
    return [];
  }
  return JSON.parse(raw);
}

function setLocalAttendance(next) {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(next));
}

function getLocalOnlyEvents() {
  return getLocalEvents().filter((event) => event?.__localOnly === true);
}

function toFriendlyError(error, fallbackMessage) {
  if (!error) return fallbackMessage;
  if (error.code === "23505") return "You are already registered for this event.";
  if (error.code === "42501") return "You are not allowed to perform this action.";
  return error.message || fallbackMessage;
}

function withTimeout(promise, timeoutMs, timeoutMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    })
  ]);
}

function isTimeoutOrNetworkError(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("timed out") ||
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("fetch")
  );
}

export async function listAdminEvents() {
  if (!hasSupabase) return getLocalEvents();

  // If the browser is offline, return local events immediately to avoid long loading states
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return getLocalEvents();
  }

  try {
    const { data, error } = await withTimeout(
      supabase.from("events").select("*").order("date", { ascending: true }),
      7000,
      "Loading events timed out."
    );
    if (error) throw error;

    const remote = data || [];
    const localOnly = getLocalOnlyEvents();
    return [...localOnly, ...remote];
  } catch (error) {
    if (isTimeoutOrNetworkError(error)) {
      return getLocalEvents();
    }
    throw new Error(toFriendlyError(error, "Failed to load events"));
  }
}

export async function listEvents() {
  if (!hasSupabase) return getLocalEvents().filter((event) => event.is_active !== false);

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return getLocalEvents().filter((event) => event.is_active !== false);
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("date", { ascending: true }),
      7000,
      "Loading events timed out."
    );

    if (error) throw error;
    const remote = data || [];
    const localOnlyActive = getLocalOnlyEvents().filter((event) => event.is_active !== false);
    return [...localOnlyActive, ...remote];
  } catch (error) {
    if (isTimeoutOrNetworkError(error)) {
      return getLocalEvents().filter((event) => event.is_active !== false);
    }
    throw new Error(toFriendlyError(error, "Failed to load events"));
  }
}

export async function listBackendEvents() {
  if (!hasSupabase) return [];

  if (typeof navigator !== "undefined" && navigator.onLine === false) return [];

  try {
    const { data, error } = await withTimeout(
      supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("date", { ascending: true }),
      7000,
      "Loading events timed out."
    );

    if (error) throw error;
    return data || [];
  } catch (error) {
    if (isTimeoutOrNetworkError(error)) return [];
    throw new Error(toFriendlyError(error, "Failed to load events"));
  }
}

export async function getEventById(id) {
  if (!hasSupabase) return getLocalEvents().find((item) => item.id === id) || null;

  const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
  if (error) throw new Error(toFriendlyError(error, "Event not found"));
  return data;
}

export async function createEvent(payload) {
  if (!hasSupabase) {
    const next = [{ id: `evt-${Date.now()}`, ...payload }, ...getLocalEvents()];
    localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
    return next[0];
  }

  const timeoutMessage = "Publishing timed out. Saved in local mode so you can continue.";

  let insertPayload = {
    ...payload,
    capacity: Number(payload.capacity),
    price: Number(payload.price),
    date: String(payload.date).slice(0, 10)
  };

  try {
    if (!insertPayload.created_by) {
      const { data: userData, error: userError } = await withTimeout(
        supabase.auth.getUser(),
        8000,
        timeoutMessage
      );

      if (userError) {
        throw userError;
      }

      if (!userData?.user?.id) {
        throw new Error("Your session is not active. Please log in again as admin.");
      }

      insertPayload = { ...insertPayload, created_by: userData.user.id };
    }

    const { data, error } = await withTimeout(
      supabase.from("events").insert(insertPayload).select("*").single(),
      20000,
      timeoutMessage
    );

    if (error) throw error;
    return data;
  } catch (error) {
    if (isTimeoutOrNetworkError(error)) {
      console.warn("createEvent: network timeout or offline — saving event locally", error);
      const localEvent = {
        id: `evt-local-${Date.now()}`,
        ...insertPayload,
        __localOnly: true,
        created_at: new Date().toISOString()
      };
      const next = [localEvent, ...getLocalEvents()];
      localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
      try {
        const unsynced = JSON.parse(localStorage.getItem("eventra-unsynced") || "[]");
        unsynced.unshift(localEvent.id);
        localStorage.setItem("eventra-unsynced", JSON.stringify(unsynced));
      } catch (e) {
        // ignore localStorage failures
      }
      return localEvent;
    }
    throw new Error(toFriendlyError(error, "Failed to create event"));
  }
}

export async function updateEvent(eventId, payload) {
  if (!hasSupabase) {
    const rows = getLocalEvents();
    const idx = rows.findIndex((item) => item.id === eventId);
    if (idx === -1) throw new Error("Event not found");
    rows[idx] = { ...rows[idx], ...payload };
    localStorage.setItem(EVENTS_KEY, JSON.stringify(rows));
    return rows[idx];
  }

  const { data, error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", eventId)
    .select("*")
    .single();

  if (error) throw new Error(toFriendlyError(error, "Failed to update event"));
  return data;
}

export async function deleteEvent(eventId) {
  if (!hasSupabase) {
    const nextEvents = getLocalEvents().filter((item) => item.id !== eventId);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(nextEvents));
    const nextRegs = getLocalRegistrations().filter((row) => row.event_id !== eventId);
    setLocalRegistrations(nextRegs);
    return;
  }

  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw new Error(toFriendlyError(error, "Failed to delete event"));
}

async function getEventRegistrationCount(eventId) {
  if (!hasSupabase) {
    return getLocalRegistrations().filter((row) => row.event_id === eventId).length;
  }

  const { count, error } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (error) throw new Error(toFriendlyError(error, "Failed to check capacity"));
  return count || 0;
}

export async function registerForEvent(eventId, user) {
  if (!hasSupabase) {
    const event = getLocalEvents().find((item) => item.id === eventId);
    if (!event) throw new Error("Event not found");

    const registrations = getLocalRegistrations();
    const existing = registrations.find((r) => r.event_id === eventId && r.user_id === user.id);
    if (existing) throw new Error("You are already registered for this event.");

    const takenSeats = registrations.filter((r) => r.event_id === eventId).length;
    if (takenSeats >= event.capacity) throw new Error("This event is full.");

    const record = {
      id: `reg-${Date.now()}`,
      user_id: user.id,
      participant_name: user.fullName || user.full_name || user.name || user.email || "Unknown",
      event_id: eventId,
      ticket_code: `EVT-${Date.now().toString().slice(-6)}`,
      attendance_status: "pending",
      created_at: new Date().toISOString()
    };
    const next = [record, ...registrations];
    setLocalRegistrations(next);

    const attendanceRows = getLocalAttendance();
    attendanceRows.unshift({
      id: `att-${Date.now()}`,
      registration_id: record.id,
      event_id: record.event_id,
      user_id: record.user_id,
      status: "pending",
      checked_in_at: null,
      created_at: new Date().toISOString()
    });
    setLocalAttendance(attendanceRows);
    return record;
  }

  const event = await getEventById(eventId);
  const currentCount = await getEventRegistrationCount(eventId);
  if (currentCount >= event.capacity) {
    throw new Error("This event is full.");
  }

  let participantName = "Unknown";
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.full_name) {
      participantName = profile.full_name;
    } else {
      participantName = user.email || "Unknown";
    }
  } catch (err) {
    console.warn("registerForEvent: failed to fetch profile name", err);
    participantName = user.email || "Unknown";
  }

  const { data, error } = await supabase
    .from("registrations")
    .insert({ 
      event_id: eventId, 
      user_id: user.id,
      participant_name: participantName
    })
    .select("*")
    .single();

  if (error) throw new Error(toFriendlyError(error, "Failed to register for event"));

  await supabase.from("attendance").insert({
    registration_id: data.id,
    event_id: data.event_id,
    user_id: data.user_id,
    status: "pending"
  });

  return data;
}

export async function getUserRegistrations(userId) {
  if (!hasSupabase) {
    const events = getLocalEvents();
    return getLocalRegistrations()
      .filter((r) => r.user_id === userId)
      .map((r) => ({ ...r, event: events.find((e) => e.id === r.event_id) }))
      .filter((r) => r.event);
  }

  const { data, error } = await supabase
    .from("registrations")
    .select("*, event:events(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(toFriendlyError(error, "Failed to load your registrations"));
  return data || [];
}

export async function listAllRegistrations() {
  if (!hasSupabase) {
    const events = getLocalEvents();
    const attendanceRows = getLocalAttendance();
    return getLocalRegistrations().map((r) => ({
      ...r,
      event: events.find((e) => e.id === r.event_id),
      attendance: attendanceRows.find((a) => a.registration_id === r.id)
    }));
  }

  const { data, error } = await supabase
    .from("registrations")
    .select("*, event:events(*), attendance:attendance(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(toFriendlyError(error, "Failed to load participant list"));
  return (data || []).map((r) => ({
    ...r,
    participant_name: r.participant_name || "Unknown"
  }));
}

export async function markAttendance(ticketCode, adminUserId = null) {
  if (!hasSupabase) {
    const rows = getLocalRegistrations();
    const idx = rows.findIndex((r) => r.ticket_code === ticketCode);
    if (idx === -1) return null;

    rows[idx] = { ...rows[idx], attendance_status: "checked_in", checked_in_at: new Date().toISOString() };
    setLocalRegistrations(rows);

    const attendanceRows = getLocalAttendance();
    const attendanceIdx = attendanceRows.findIndex((a) => a.registration_id === rows[idx].id);
    const now = new Date().toISOString();
    if (attendanceIdx === -1) {
      attendanceRows.unshift({
        id: `att-${Date.now()}`,
        registration_id: rows[idx].id,
        event_id: rows[idx].event_id,
        user_id: rows[idx].user_id,
        status: "present",
        checked_in_at: now,
        checked_in_by: adminUserId
      });
    } else {
      attendanceRows[attendanceIdx] = {
        ...attendanceRows[attendanceIdx],
        status: "present",
        checked_in_at: now,
        checked_in_by: adminUserId
      };
    }
    setLocalAttendance(attendanceRows);

    return rows[idx];
  }

  const { data: row, error: findError } = await supabase
    .from("registrations")
    .select("*")
    .eq("ticket_code", ticketCode)
    .single();
  if (findError) throw findError;

  const { data, error } = await supabase
    .from("registrations")
    .update({ attendance_status: "checked_in", checked_in_at: new Date().toISOString() })
    .eq("id", row.id)
    .select("*")
    .single();

  if (error) throw new Error(toFriendlyError(error, "Failed to mark attendance"));

  await supabase
    .from("attendance")
    .upsert(
      {
        registration_id: data.id,
        event_id: data.event_id,
        user_id: data.user_id,
        status: "present",
        checked_in_at: new Date().toISOString(),
        checked_in_by: adminUserId
      },
      { onConflict: "registration_id" }
    );

  return data;
}

export async function logScanAttempt(scannerId, ticketCode, status, processingTimeMs = 500, deviceInfo = "Terminal A") {
  if (!hasSupabase) {
    const logs = JSON.parse(localStorage.getItem("eventra-scan-logs") || "[]");
    const newLog = {
      id: `scan-${Date.now()}`,
      scanner_id: scannerId,
      device_info: deviceInfo,
      ticket_code: ticketCode,
      status: status,
      processing_time_ms: processingTimeMs,
      scanned_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    localStorage.setItem("eventra-scan-logs", JSON.stringify(logs.slice(0, 50)));
    return newLog;
  }

  const { data, error } = await supabase
    .from("scan_logs")
    .insert({
      scanner_id: scannerId,
      device_info: deviceInfo,
      ticket_code: ticketCode,
      status: status,
      processing_time_ms: processingTimeMs
    })
    .select("*")
    .maybeSingle();

  if (error) {
    console.warn("Failed to insert scan log in Supabase:", error);
  }
  return data;
}

export async function getScannerStats() {
  if (!hasSupabase) {
    const regs = getLocalRegistrations();
    const att = getLocalAttendance();
    const logs = JSON.parse(localStorage.getItem("eventra-scan-logs") || "[]");

    const totalCheckedIn = att.filter(a => a.status === "present").length;
    const vipCheckedIn = regs.filter(r => r.ticket_type === "vip" && r.attendance_status === "checked_in").length;
    const fifteenMinAgo = Date.now() - 15 * 60 * 1000;
    const activeScanners = new Set(
      logs.filter(l => new Date(l.scanned_at).getTime() >= fifteenMinAgo && l.scanner_id).map(l => l.scanner_id)
    ).size;
    
    const validLogs = logs.filter(l => l.processing_time_ms);
    const avgScanTime = validLogs.length 
      ? validLogs.reduce((acc, curr) => acc + curr.processing_time_ms, 0) / validLogs.length
      : 500;

    const recentHistory = logs.slice(0, 5).map(l => {
      let name = l.ticket_code;
      if (l.status === "success") {
        const r = regs.find(reg => reg.ticket_code === l.ticket_code);
        if (r) name = r.participant_name;
      } else {
        name = `Ticket #${l.ticket_code}`;
      }
      return {
        id: l.id,
        name: name,
        success: l.status === "success",
        time: new Date(l.scanned_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
    });

    return {
      totalCheckedIn,
      vipCheckedIn,
      activeScanners: activeScanners || 1,
      avgScanTime: avgScanTime / 1000,
      recentHistory
    };
  }

  const { count: totalCheckedIn } = await supabase
    .from("attendance")
    .select("id", { count: "exact", head: true })
    .eq("status", "present");

  const { count: vipCheckedIn } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("attendance_status", "checked_in")
    .eq("ticket_type", "vip");

  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: scannerData } = await supabase
    .from("scan_logs")
    .select("scanner_id")
    .gte("scanned_at", fifteenMinsAgo);
  const activeScanners = new Set((scannerData || []).map(d => d.scanner_id).filter(Boolean)).size;

  const { data: scanTimeData } = await supabase
    .from("scan_logs")
    .select("processing_time_ms");
  const totalLogs = scanTimeData?.length || 0;
  const avgScanTime = totalLogs 
    ? (scanTimeData.reduce((acc, curr) => acc + (curr.processing_time_ms || 500), 0) / totalLogs) / 1000 
    : 0.5;

  const { data: rawLogs } = await supabase
    .from("scan_logs")
    .select("*")
    .order("scanned_at", { ascending: false })
    .limit(5);
  
  const recentHistory = [];
  if (rawLogs && rawLogs.length) {
    const ticketCodes = rawLogs.map(l => l.ticket_code).filter(Boolean);
    let attendeeMap = {};
    if (ticketCodes.length) {
      const { data: regs } = await supabase
        .from("registrations")
        .select("ticket_code, participant_name")
        .in("ticket_code", ticketCodes);
      
      attendeeMap = (regs || []).reduce((acc, r) => {
        acc[r.ticket_code] = r.participant_name || "Unknown";
        return acc;
      }, {});
    }

    rawLogs.forEach(l => {
      recentHistory.push({
        id: l.id,
        name: l.status === "success" ? (attendeeMap[l.ticket_code] || "Attendee") : `Ticket #${l.ticket_code}`,
        success: l.status === "success",
        time: new Date(l.scanned_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });
    });
  }

  return {
    totalCheckedIn: totalCheckedIn || 0,
    vipCheckedIn: vipCheckedIn || 0,
    activeScanners: activeScanners || 1,
    avgScanTime: parseFloat(avgScanTime.toFixed(1)) || 0.5,
    recentHistory
  };
}

export async function getDashboardAnalytics() {
  if (!hasSupabase) {
    const att = getLocalAttendance();
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const flowMap = weekdays.reduce((acc, day) => {
      acc[day] = 0;
      return acc;
    }, {});
    
    flowMap["Mon"] = 120;
    flowMap["Tue"] = 230;
    flowMap["Wed"] = 482;
    flowMap["Thu"] = 310;
    flowMap["Fri"] = 390;
    flowMap["Sat"] = 180;
    flowMap["Sun"] = 90;

    att.forEach(a => {
      if (a.checked_in_at) {
        const day = weekdays[new Date(a.checked_in_at).getDay()];
        flowMap[day] += 1;
      }
    });

    const flowData = weekdays.map((day, idx) => ({
      day_of_week: day,
      day_num: idx + 1,
      check_ins_count: flowMap[day]
    }));

    const todayStr = new Date().toDateString();
    const attendanceToday = att.filter(a => a.checked_in_at && new Date(a.checked_in_at).toDateString() === todayStr).length;

    return {
      flowData,
      peakDay: "Wed",
      peakCount: 482,
      attendanceToday: attendanceToday || 482
    };
  }

  const { data: flowRows } = await supabase
    .from("view_daily_attendance_flow")
    .select("*")
    .order("day_num");
  
  const flowData = flowRows || [];

  let peakDay = "—";
  let peakCount = 0;
  if (flowData.length) {
    const peak = [...flowData].sort((a, b) => b.check_ins_count - a.check_ins_count)[0];
    peakDay = peak.day_of_week;
    peakCount = peak.check_ins_count;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: attendanceToday } = await supabase
    .from("attendance")
    .select("id", { count: "exact", head: true })
    .gte("checked_in_at", todayStart.toISOString());

  return {
    flowData,
    peakDay,
    peakCount,
    attendanceToday: attendanceToday || 0
  };
}

export async function getManageEventsAnalytics() {
  if (!hasSupabase) {
    const regs = getLocalRegistrations();
    return {
      liveRegistrations: regs.length || 0,
      peakEventTitle: "Global Tech Summit '24",
      peakEventCapacityRate: 98
    };
  }

  const { count: liveRegistrations } = await supabase
    .from("registrations")
    .select("id, event:events!inner(is_active)", { count: "exact", head: true })
    .eq("event.is_active", true);

  const { data: peakPerf } = await supabase
    .from("view_event_peak_performance")
    .select("title, capacity_percentage")
    .order("capacity_percentage", { ascending: false })
    .limit(1);

  const peak = peakPerf?.[0];

  return {
    liveRegistrations: liveRegistrations || 0,
    peakEventTitle: peak?.title || "—",
    peakEventCapacityRate: peak ? Math.round(peak.capacity_percentage) : 0
  };
}

export async function getAttendanceReportAnalytics(eventId) {
  if (!hasSupabase) {
    const intervals = ["08:00", "10:00", "12:00", "14:00", "16:00"];
    const mockData = intervals.map(time => ({
      hourly_interval: time,
      check_ins_count: time === "08:00" ? 740 : time === "10:00" ? 212 : time === "12:00" ? 150 : 80
    }));
    return mockData;
  }

  const query = supabase
    .from("view_hourly_check_ins")
    .select("hourly_interval, check_ins_count");
  
  if (eventId && eventId !== "all" && eventId !== "All Events (filtering not supported by current API)") {
    query.eq("event_id", eventId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to load hourly check-in flow:", error);
    return [];
  }
  return data || [];
}

