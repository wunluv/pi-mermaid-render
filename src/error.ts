export class RenderError extends Error {
  constructor(
    message: string,
    public readonly code: 'UNSUPPORTED_TYPE' | 'INVALID_SOURCE' | 'THEME_NOT_FOUND' | 'CONVERSION_FAILED' | 'BACKEND_ERROR',
  ) {
    super(message);
    this.name = 'RenderError';
  }
}
