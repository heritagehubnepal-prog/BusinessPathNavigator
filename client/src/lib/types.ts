export interface DashboardAnalytics {
  breakEvenProgress: number;
  totalYieldThisMonth: number;
  contaminationRate: number;
  revenueThisMonth: number;
  expensesThisMonth: number;
  profitThisMonth: number;
  activeBatchesCount: number;
  completedMilestonesCount: number;
  totalBonusEarned: number;
}

export interface ProductionAnalytics {
  [month: string]: {
    mushrooms: number;
    mycelium: number;
  };
}
