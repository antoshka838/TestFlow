import { useMemo, useState } from "react";

export function useSearch(data, key) {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search) return data;

    return data.filter((item) =>
      item[key].toLowerCase().includes(search.toLowerCase())
    );
  }, [data, key, search]);

  return { search, setSearch, filteredData };
}