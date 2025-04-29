import { Module } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';
import { RetryService } from './retry.service';
import { RateLimiterService } from './rate-limiter.service';
import { TimeLimiterService } from './time-limiter.service';

@Module({
  providers: [
    CircuitBreakerService,
    RetryService,
    RateLimiterService,
    TimeLimiterService,
  ],
  exports: [
    CircuitBreakerService,
    RetryService,
    RateLimiterService,
    TimeLimiterService,
  ],
})
export class FaultToleranceModule {}
