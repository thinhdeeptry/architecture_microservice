import { Injectable, Logger } from '@nestjs/common';

export interface RetryOptions {
  maxRetries: number;
  delay: number;
  backoffFactor: number;
  retryableErrors?: Array<any>;
}

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  async execute<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {
      maxRetries: 3,
      delay: 1000,
      backoffFactor: 2,
    },
  ): Promise<T> {
    let retries = 0;
    let currentDelay = options.delay;
    const { maxRetries, backoffFactor, retryableErrors } = options;

    while (true) {
      try {
        return await fn();
      } catch (error) {
        // Check if we should retry this error
        if (
          retryableErrors &&
          !retryableErrors.some(
            (errClass) => error instanceof errClass || error.name === errClass.name,
          )
        ) {
          this.logger.error(
            `Error is not retryable: ${error.message}`,
            error.stack,
          );
          throw error;
        }

        retries++;
        if (retries > maxRetries) {
          this.logger.error(
            `Max retries (${maxRetries}) exceeded: ${error.message}`,
            error.stack,
          );
          throw error;
        }

        this.logger.warn(
          `Retry ${retries}/${maxRetries} after ${currentDelay}ms: ${error.message}`,
        );

        // Wait for the delay
        await new Promise((resolve) => setTimeout(resolve, currentDelay));

        // Increase delay for next retry using exponential backoff
        currentDelay = currentDelay * backoffFactor;
      }
    }
  }
}
