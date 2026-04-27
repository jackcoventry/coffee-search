import { Suspense } from 'react';
import { SearchPanel } from '@/components/SearchPanel/SearchPanel';

export default function Home() {
  return (
    <Suspense
      fallback={
        <section
          className="overflow-hidden flex flex-col justify-center items-center bg-100001 p-3 mx-3 lg:mx-5 border-white min-h-(--shell-height)"
          aria-hidden="true"
        />
      }
    >
      <SearchPanel />
    </Suspense>
  );
}
