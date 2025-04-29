import { Injectable, Logger } from '@nestjs/common';

export interface TimeLimiterOptions {
  timeoutMs: number;
}

@Injectable()
export class TimeLimiterService {
  private readonly logger = new Logger(TimeLimiterService.name);

  async execute<T>(
    fn: () => Promise<T>,
    options: TimeLimiterOptions = { timeoutMs: 5000 },
  ): Promise<T> {
    const { timeoutMs } = options;

    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      // Race the function against the timeout
      return await Promise.race([fn(), timeoutPromise]);
    } catch (error) {
      if (error.message.includes('Operation timed out')) {
        this.logger.error(`Time limiter: ${error.message}`);
      }
      throw error;
    }
  }
}
