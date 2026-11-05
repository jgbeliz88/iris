/**
 * An error thrown on purpose by a service. Its message is always safe to return
 * to the client, unlike unexpected errors, whose messages are hidden on 5xx.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
