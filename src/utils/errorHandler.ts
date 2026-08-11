export function handleSupabaseError(error: unknown, customMessage: string): string {
  console.error(`[TruckingEdge Error] ${customMessage}:`, error);
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  
  return customMessage || 'An unexpected database error occurred.';
}