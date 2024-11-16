// Temporary mock implementation until Firebase is set up
export const getUserAssessments = async (userId: string) => {
  return [];
};

export const addAssessment = async (assessment: any) => {
  console.log('Mock adding assessment:', assessment);
  return { id: 'mock-id' };
};

export const getAssessmentQuestions = async (domain: string) => {
  return [];
};

export const getResources = async () => {
  return [];
};

export const saveAssessmentResult = async (userId: string, result: any) => {
  console.log('Mock saving assessment result:', result);
  return true;
};
