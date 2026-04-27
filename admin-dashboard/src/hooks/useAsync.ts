import { useEffect, useState } from "react";

export const useAsync = <T,>(loader: () => Promise<T>, deps: unknown[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    loader()
      .then((result) => {
        if (mounted) setData(result);
      })
      .catch((caught: Error) => {
        if (mounted) setError(caught.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, deps);

  return { data, loading, error, setData };
};
