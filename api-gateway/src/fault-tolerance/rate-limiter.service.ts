import { Injectable, Logger } from '@nestjs/common';

export interface RateLimiterOptions {
  maxRequests: number;
  timeWindowMs: number;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly limiters = new Map<
    string,
    {
      options: RateLimiterOptions;
      requestTimestamps: number[];
    }
  >();

  create(name: string, options: RateLimiterOptions): void {
    this.limiters.set(name, {
      options,
      requestTimestamps: [],
    });
    this.logger.log(
      `Rate limiter '${name}' created with ${options.maxRequests} requests per ${
        options.timeWindowMs / 1000
      } seconds`,
    );
  }

  private getLimiter(name: string) {
    const limiter = this.limiters.get(name);
    if (!limiter) {
      throw new Error(`Rate limiter with name '${name}' not found`);
    }
    return limiter;
  }

  async execute<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const limiter = this.getLimiter(name);
    const { options, requestTimestamps } = limiter;
    const now = Date.now();

    // Remove timestamps outside the time window
    const validTimestamps = requestTimestamps.filter(
      (timestamp) => now - timestamp < options.timeWindowMs,
    );

    // Update the timestamps array
    limiter.requestTimestamps = validTimestamps;

    // Check if we've reached the limit
    if (validTimestamps.length >= options.maxRequests) {
      const oldestTimestamp = validTimestamps[0];
      const resetTime = oldestTimestamp + options.timeWindowMs - now;
      
      this.logger.warn(
        `Rate limit exceeded for '${name}'. Reset in ${resetTime}ms.`,
      );
      
      throw new Error(
        `Rate limit exceeded. Try again in ${resetTime}ms.`,
      );
    }

    // Add current timestamp and execute the function
    limiter.requestTimestamps.push(now);
    return fn();
  }

  getRemainingRequests(name: string): number {
    const limiter = this.getLimiter(name);
    const { options, requestTimestamps } = limiter;
    const now = Date.now();

    // Remove timestamps outside the time window
    const validTimestamps = requestTimestamps.filter(
      (timestamp) => now - timestamp < options.timeWindowMs,
    );

    return Math.max(0, options.maxRequests - validTimestamps.length);
  }
}
