export interface OperationalAlert {
  id: string;
  type: 'WARNING' | 'CRITICAL' | 'ACTION_REQUIRED';
  category: 'COMPLIANCE' | 'FINANCIAL' | 'OPERATIONS' | 'MAINTENANCE';
  title: string;
  description: string;
  entityId: string;
  entityType: 'driver' | 'load' | 'truck' | 'invoice';
  suggestedActionLabel: string;
}

export const evaluateOperationalIntelligence = (data: {
  drivers?: Array<{ id: string; name: string; cdlExpirationDate: string; availableHours?: number }>;
  loads?: Array<{ id: string; loadNumber: string; status: string; margin: number; hasPod: boolean; targetMargin: number; estimatedDriveHours?: number; invoiceStatus?: 'PENDING' | 'GENERATED' | 'OVERDUE' }>;
  trucks?: Array<{ id: string; unitNumber: string; nextServiceDueMiles: number; currentMiles: number }>;
}): OperationalAlert[] => {
  const alerts: OperationalAlert[] = [];
  const today = new Date();

  // 1. Driver CDL & HOS Limit Checks
  data.drivers?.forEach(driver => {
    const expDate = new Date(driver.cdlExpirationDate);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays <= 30) {
      alerts.push({
        id: `cdl-${driver.id}`,
        type: diffDays <= 7 ? 'CRITICAL' : 'WARNING',
        category: 'COMPLIANCE',
        title: `CDL Expiring Soon: ${driver.name}`,
        description: `CDL expires in ${diffDays} days (${driver.cdlExpirationDate}). Immediate renewal required.`,
        entityId: driver.id,
        entityType: 'driver',
        suggestedActionLabel: 'Renew CDL'
      });
    }

    if (driver.availableHours !== undefined && driver.availableHours < 3) {
      alerts.push({
        id: `hos-${driver.id}`,
        type: 'CRITICAL',
        category: 'COMPLIANCE',
        title: `Low HOS Warning: ${driver.name}`,
        description: `Driver has only ${driver.availableHours} hours remaining before mandatory rest break/violation risk.`,
        entityId: driver.id,
        entityType: 'driver',
        suggestedActionLabel: 'Reassignment Needed'
      });
    }
  });

  // 2. Load Financials, PODs, Invoicing & Profitability Checks
  data.loads?.forEach(load => {
    if (load.status === 'DELIVERED') {
      if (!load.hasPod) {
        alerts.push({
          id: `pod-${load.id}`,
          type: 'ACTION_REQUIRED',
          category: 'FINANCIAL',
          title: `Missing POD for Load #${load.loadNumber}`,
          description: 'Load is delivered but Proof of Delivery document has not been uploaded, delaying billing.',
          entityId: load.id,
          entityType: 'load',
          suggestedActionLabel: 'Upload POD'
        });
      } else if (load.invoiceStatus === 'PENDING' || !load.invoiceStatus) {
        alerts.push({
          id: `inv-${load.id}`,
          type: 'ACTION_REQUIRED',
          category: 'FINANCIAL',
          title: `Invoice Ready: Load #${load.loadNumber}`,
          description: 'POD is verified and approved. Invoice is ready to be generated for accounts receivable.',
          entityId: load.id,
          entityType: 'load',
          suggestedActionLabel: 'Generate Invoice'
        });
      }
    }

    if (load.margin < (load.targetMargin || 15)) {
      alerts.push({
        id: `margin-${load.id}`,
        type: 'WARNING',
        category: 'FINANCIAL',
        title: `Low Margin on Load #${load.loadNumber}`,
        description: `Current gross margin (${load.margin}%) is below target threshold (${load.targetMargin || 15}%).`,
        entityId: load.id,
        entityType: 'load',
        suggestedActionLabel: 'Review Profitability'
      });
    }
  });

  return alerts;
};