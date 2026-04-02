import { useState, useEffect, useCallback } from "react";

export const useGet = ({ url, headers = {}, onComplete, lazy = false }) => {
  const [state, setState] = useState({
    loading: !lazy,
    error: null,
    data: null,
  });

  const get = useCallback(
    async ({ url: newUrl, headers: newHeaders } = {}) => {
      const updatedUrl = newUrl ?? url;
      const updatedHeaders = newHeaders ?? headers;

      setState((prevState) => ({ ...prevState, loading: true, error: null }));

      try {
        const response = await fetch(updatedUrl, { headers: updatedHeaders });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        setState((prevState) => ({ ...prevState, data: jsonData }));
        if (onComplete) onComplete(jsonData);
      } catch (e) {
        setState((prevState) => ({ ...prevState, error: e }));
      } finally {
        setState((prevState) => ({ ...prevState, loading: false }));
      }
    },
    [url, headers, onComplete],
  ); // Dependencies for useCallback

  useEffect(() => {
    if (!lazy) {
      get();
    }
  }, []); // Dependencies for useEffect

  const clearData = useCallback(() => {
    setState((prevState) => ({ ...prevState, data: null, error: null }));
  }, []);

  return [state.loading, state.error, state.data, { get, clearData }];
};
