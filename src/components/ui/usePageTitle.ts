import { useEffect } from 'react';
import { BRAND } from '../../config/brand';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | ${BRAND.name}`;
  }, [title]);
}
