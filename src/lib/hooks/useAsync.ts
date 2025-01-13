import {useEffect, useState} from "react";


const useAsync = <T>(asyncFunction: () => Promise<T>) => {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoaded(false);
      setError(false);
      try {
        const response = await asyncFunction();
        setData(response);
      } catch (e) {
        setError(true);
      }
      setLoading(false);
      setLoaded(true);
    })();
  }, [asyncFunction]);

  return {loading, loaded, error, data};
}

export {useAsync}