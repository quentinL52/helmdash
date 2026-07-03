'use client';

import { useEffect, useState } from 'react';

export function CohortBadge() {
  const [data, setData] = useState<{ current: string; seatsLeft: number; cohorts: any } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/billing/cohort-status')
      .then((res) => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then((json) => setData(json))
      .catch(() => setError(true));
  }, []);

  if (error) return null;

  if (!data) {
    return (
      <span className="inline-flex h-4 w-32 animate-pulse rounded bg-muted"></span>
    );
  }

  const max = data.current === 'founders' ? data.cohorts.founders.max : data.cohorts.early.max;
  const capitalizedCohort = data.current.charAt(0).toUpperCase() + data.current.slice(1);

  return (
    <span>
      {data.seatsLeft}/{max} {capitalizedCohort} seats left
    </span>
  );
}
