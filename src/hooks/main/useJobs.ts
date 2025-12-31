import { useState, useCallback, useEffect } from "react";
import { jobService } from "@/api/services";
import { JobData } from "@/types/job";

export const useJobs = () => {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const TOTAL_PAGES = 4;
      const requests = Array.from({ length: TOTAL_PAGES }, (_, i) =>
        jobService.getCrawledJobs({ page: (i + 1).toString() })
      );

      const responses = await Promise.all(requests);
      const combined = responses.flatMap((res) =>
        Array.isArray(res.data) ? res.data : []
      );

      const uniqueJobs = combined
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.url === item.url)
        )
        .slice(0, 20);

      setJobs(uniqueJobs);
    } catch (e) {
      console.error("데이터 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, refetch: fetchJobs };
};
