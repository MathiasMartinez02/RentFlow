"use client";

import { useMemo, useState } from "react";
import { MOCK_ACTIVITY } from "../mock/activity.mock";
import type { ActivityCategory } from "../types";
import { groupByDate } from "../utils/time.utils";

export type ActivityFilter = "all" | ActivityCategory;

export function useActivity(initialFilter: ActivityFilter = "all") {
  const [filter, setFilter] = useState<ActivityFilter>(initialFilter);

  const filtered = useMemo(() => {
    if (filter === "all") return MOCK_ACTIVITY;
    return MOCK_ACTIVITY.filter((e) => e.category === filter);
  }, [filter]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const totalCount = MOCK_ACTIVITY.length;
  const todayCount = useMemo(() => {
    const today = "2026-05-19";
    return MOCK_ACTIVITY.filter((e) => e.createdAt.startsWith(today)).length;
  }, []);

  return {
    events: filtered,
    grouped,
    filter,
    setFilter,
    totalCount,
    todayCount,
  };
}
