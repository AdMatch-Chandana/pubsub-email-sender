export interface ErrorLogEntry {
    errorDetails: string[];
    url: string;
}
  
export interface ErrorBreakdown {
    errorCount: number;
    errorCode: string;
    errorLogEntries: ErrorLogEntry[];
}
  
export interface EventData {
    state?: string;
    status?: string;
    destinationDatasetId?: string;
    errorStatus?: {
      message: string;
      code: string;
    };
    errorBreakdowns?: ErrorBreakdown[];
}