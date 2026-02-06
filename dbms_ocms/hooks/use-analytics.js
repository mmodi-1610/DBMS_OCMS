"use client";

import { useState, useEffect, useCallback } from "react";

export function useAnalytics(initialFilters = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    programType: "",
    courseId: "",
    startDate: "",
    endDate: "",
    view: "course",
    ...initialFilters,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.programType) params.set("programType", filters.programType);
      if (filters.courseId) params.set("courseId", filters.courseId);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.view) params.set("view", filters.view);

      const res = await fetch(`/api/analytics?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      programType: "",
      courseId: "",
      startDate: "",
      endDate: "",
      view: "course",
    });
  }, []);

  return { data, loading, error, filters, updateFilters, resetFilters, refetch: fetchData };
}
