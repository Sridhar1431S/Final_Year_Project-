import { Dashboard } from '@/components/dashboard/Dashboard';
import { DatasetProvider } from '@/contexts/DatasetContext';
import { FilterProvider } from '@/contexts/FilterContext';
import { Helmet } from 'react-helmet-async';

export function DashboardPage() {
  return (
    <>
      <Helmet>
        <title>EmpAI - Employee Performance Analytics Dashboard</title>
        <meta name="description" content="AI-powered employee performance analytics with ML predictions, regression analysis, and productivity insights." />
      </Helmet>
      <DatasetProvider>
        <FilterProvider>
          <Dashboard />
        </FilterProvider>
      </DatasetProvider>
    </>
  );
}
