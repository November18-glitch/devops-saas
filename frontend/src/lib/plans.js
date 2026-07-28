export const PLANS = {
  FREE: {
    maxProjects: 1,
    maxDeployments: 5,
    maxTeamMembers: 3,

    aiAnalyzer: false,
    automation: false,
  },

  PRO: {
    maxProjects: Infinity,
    maxDeployments: Infinity,
    maxTeamMembers: Infinity,

    aiAnalyzer: true,
    automation: true,
  },
};