import { useMemo } from "react";
import { useLocation } from "react-router-dom"

export const useQueryParams = () => {
  const { search } = useLocation();
  const urlSearchParams = useMemo(() => new URLSearchParams(search), [search]);

  return urlSearchParams;
}