import { useState, useMemo } from 'react';

export interface FilterSortOptions<T> {
  items: T[];
  searchFields: (keyof T)[];
  defaultSortField?: keyof T;
  defaultSortDir?: 'asc' | 'desc';
  pageSize?: number;
}

export function useFilterSort<T>({
  items,
  searchFields,
  defaultSortField,
  defaultSortDir = 'asc',
  pageSize = 25,
}: FilterSortOptions<T>) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof T | undefined>(defaultSortField);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDir);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  const filtered = useMemo(() => {
    let result = items;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(item =>
        searchFields.some(f => String(item[f]).toLowerCase().includes(q))
      );
    }

    for (const [key, values] of Object.entries(filters)) {
      if (values.length > 0) {
        result = result.filter(item => values.includes(String((item as Record<string, unknown>)[key])));
      }
    }

    if (sortField) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [items, search, searchFields, sortField, sortDir, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  function toggleSort(field: keyof T) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function setFilter(key: string, values: string[]) {
    setFilters(f => ({ ...f, [key]: values }));
    setPage(0);
  }

  return {
    search, setSearch,
    sortField, sortDir, toggleSort,
    page, setPage, totalPages,
    filters, setFilter,
    filtered, paged,
  };
}
