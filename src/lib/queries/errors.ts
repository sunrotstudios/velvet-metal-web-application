import { toast } from "sonner";

export class QueryError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'QueryError';
  }
}

interface PostgrestError {
  code: string;
  message: string;
  details?: string;
}

interface ApiError {
  status?: number;
  message?: string;
}

export function handleQueryError(error: unknown): Error {
  if (typeof error === 'string') {
    return new Error(error);
  }

  if (error instanceof Error) {
    return error;
  }

  const pgError = error as PostgrestError;
  if (pgError.code) {
    switch (pgError.code) {
      case 'PGRST116':
        return new Error('Resource not found');
      case '23505':
        return new Error('Duplicate record');
      case '42P01':
        return new Error('Table not found');
      default:
        return new Error(pgError.message || 'Database error');
    }
  }

  const apiError = error as ApiError;
  if (apiError.status) {
    switch (apiError.status) {
      case 401:
        return new Error('Unauthorized');
      case 403:
        return new Error('Forbidden');
      case 404:
        return new Error('Resource not found');
      case 429:
        return new Error('Rate limit exceeded');
      default:
        return new Error(apiError.message || 'API error');
    }
  }

  return new Error('An unknown error occurred');
}

export function handleMutationError(error: unknown, defaultMessage: string): Error {
  const err = handleQueryError(error);
  err.message = `${defaultMessage}: ${err.message}`;
  return err;
}