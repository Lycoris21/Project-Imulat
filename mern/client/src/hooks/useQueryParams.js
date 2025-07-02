// useQueryParams.js
import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export default function useQueryParams(defaults = {
  search: '',
  sort: 'newest',
  page: 1,
  user: null
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || defaults.search;
  const sort = searchParams.get('sort') || defaults.sort;
  const page = parseInt(searchParams.get('page') || defaults.page, 10);
  const user = searchParams.get('user') || defaults.user;

  const updateParams = useCallback((updates) => {
    const newParams = new URLSearchParams();

    // Enforced order: search → user → sort → page
    const final = {
      search: updates.search ?? search,
      user: updates.user ?? user,
      sort: updates.sort ?? sort,
      page: updates.page ?? page,
    };

    if (final.search?.toString().trim()) newParams.set('search', final.search);
    if (final.user?.toString().trim()) newParams.set('user', final.user);
    if (final.sort?.toString().trim()) newParams.set('sort', final.sort);
    if (final.page?.toString().trim()) newParams.set('page', final.page);

    setSearchParams(newParams);
  }, [search, sort, page, user, setSearchParams]);

  return useMemo(() => ({
    search,
    sort,
    page,
    user,
    updateParams,
  }), [search, sort, page, user, updateParams]);
}
