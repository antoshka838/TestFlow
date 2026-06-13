import { useMemo, useState } from "react";

export function useSearch(data, key) {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;

    const lowerSearch = search.trim().toLowerCase();

    return data.filter((item) =>
      String(item[key] || "")
        .toLowerCase()
        .includes(lowerSearch),
    );
  }, [data, key, search]);

  return { search, setSearch, filteredData };
}
