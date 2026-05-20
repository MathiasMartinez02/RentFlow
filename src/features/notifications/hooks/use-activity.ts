"use client";

import { useMemo, useState, useEffect } from "react";
import { activityService } from "@/services/activity.service";
import type { ActivityEvent, ActivityCategory } from "../types";
import { groupByDate } from "../utils/time.utils";

export type ActivityFilter = "all" | ActivityCategory;

export function useActivity(initialFilter: ActivityFilter = "all") {
  const [allEvents, setAllEvents] = useState<ActivityEvent[]>([]);
  const [filter, setFilter] = useState<ActivityFilter>(initialFilter);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    activityService
      .getAll({ limit: 100 })
      .then((events) => setAllEvents(events))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo<ActivityEvent[]>(() => {
    if (filter === "all") return allEvents;
    return allEvents.filter((e) => e.category === filter);
  }, [allEvents, filter]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const totalCount = allEvents.length;
  const todayCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return allEvents.filter((e) => e.createdAt.startsWith(today)).length;
  }, [allEvents]);

  return {
    events: filtered,
    grouped,
    filter,
    setFilter,
    totalCount,
    todayCount,
    isLoading,
  };
}
