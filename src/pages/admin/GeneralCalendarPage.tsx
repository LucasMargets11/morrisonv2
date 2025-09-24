import { lazy, Suspense } from 'react';
const GeneralAvailabilityCalendar = lazy(() => import('../../components/admin/GeneralAvailabilityCalendar'));

const GeneralCalendarPage = () => (
  <div className="container mx-auto px-4 py-8">
    <Suspense fallback={<div>Cargando calendario…</div>}>
      <GeneralAvailabilityCalendar />
    </Suspense>
  </div>
);

export default GeneralCalendarPage;