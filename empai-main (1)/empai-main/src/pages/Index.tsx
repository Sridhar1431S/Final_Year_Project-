import { Dashboard } from '@/components/dashboard/Dashboard';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>EmpAI - Employee Performance Analytics Dashboard</title>
        <meta name="description" content="AI-powered employee performance analytics with ML predictions, regression analysis, and productivity insights." />
      </Helmet>
      <Dashboard />
    </>
  );
};

export default Index;
