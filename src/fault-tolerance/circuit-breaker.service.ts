import { Injectable, Logger } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly breakers = new Map<string, CircuitBreaker>();

  create(
    name: string,
    fn: (...args: any[]) => Promise<any>,
    options: CircuitBreaker.Options = {},
  ): CircuitBreaker {
    const defaultOptions: CircuitBreaker.Options = {
      failureThreshold: 50, // When 50% of requests fail, trip the circuit
      resetTimeout: 10000, // After 10 seconds, try again
      timeout: 3000, // If function takes longer than 3 seconds, count as failure
      errorThresholdPercentage: 50, // Same as failureThreshold
      ...options,
    };

    const breaker = new CircuitBreaker(fn, defaultOptions);

    // Add event listeners
    breaker.on('open', () => {
      this.logger.warn(`Circuit Breaker '${name}' is open`);
    });

    breaker.on('close', () => {
      this.logger.log(`Circuit Breaker '${name}' is closed`);
    });

    breaker.on('halfOpen', () => {
      this.logger.log(`Circuit Breaker '${name}' is half open`);
    });

    breaker.on('fallback', (result) => {
      this.logger.warn(`Circuit Breaker '${name}' fallback called with: ${result}`);
    });

    breaker.on('timeout', () => {
      this.logger.warn(`Circuit Breaker '${name}' timeout`);
    });

    breaker.on('reject', () => {
      this.logger.warn(`Circuit Breaker '${name}' rejected`);
    });

    breaker.on('success', () => {
      this.logger.debug(`Circuit Breaker '${name}' success`);
    });

    breaker.on('failure', (error) => {
      this.logger.error(`Circuit Breaker '${name}' failure: ${error.message}`);
    });

    this.breakers.set(name, breaker);
    return breaker;
  }

  get(name: string): CircuitBreaker {
    const breaker = this.breakers.get(name);
    if (!breaker) {
      throw new Error(`Circuit breaker with name '${name}' not found`);
    }
    return breaker;
  }

  execute(name: string, ...args: any[]): Promise<any> {
    return this.get(name).fire(...args);
  }

  getStatus(name: string): string {
    const breaker = this.get(name);
    if (breaker.opened) return 'OPEN';
    if (breaker.halfOpen) return 'HALF_OPEN';
    return 'CLOSED';
  }

  getAllStatus(): Record<string, string> {
    const status = {};
    this.breakers.forEach((breaker, name) => {
      status[name] = this.getStatus(name);
    });
    return status;
  }
}
