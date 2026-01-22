import { supabase } from "@/integrations/supabase/client";

export async function predictPerformance(employeeData: any) {
  const { data, error } = await supabase.functions.invoke('predict-performance', {
    body: employeeData
  });
  
  if (error) {
    throw new Error(error.message || 'Prediction failed');
  }
  
  return data;
}

export async function getFeatureImportance() {
  const { data, error } = await supabase.functions.invoke('predict-performance', {
    body: {},
    method: 'GET'
  });
  
  if (error) {
    throw new Error(error.message || 'Failed to get feature importance');
  }
  
  return data;
}

export async function healthCheck() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const { data, error } = await supabase.functions.invoke('predict-performance', {
      body: { action: 'health' }
    });
    
    clearTimeout(timeoutId);
    
    if (error) {
      return { online: false, error: error.message };
    }
    
    return { online: data?.status === 'healthy' };
  } catch (error) {
    return { 
      online: false, 
      error: error instanceof Error ? error.message : 'Connection failed' 
    };
  }
}
