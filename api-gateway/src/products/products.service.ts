import { Injectable, HttpException, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { CircuitBreakerService } from '../fault-tolerance/circuit-breaker.service';
import { RetryService } from '../fault-tolerance/retry.service';
import { RateLimiterService } from '../fault-tolerance/rate-limiter.service';
import { TimeLimiterService } from '../fault-tolerance/time-limiter.service';

@Injectable()
export class ProductsService implements OnModuleInit {
  private productServiceUrl: string;
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly retryService: RetryService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly timeLimiterService: TimeLimiterService,
  ) {
    this.productServiceUrl = this.configService.get<string>('PRODUCT_SERVICE_URL') || 'http://product-service:3000/api';
  }

  onModuleInit() {
    // Initialize circuit breakers
    this.circuitBreakerService.create('findAllProducts', this.findAllProductsRaw.bind(this));
    this.circuitBreakerService.create('findOneProduct', this.findOneProductRaw.bind(this));
    this.circuitBreakerService.create('createProduct', this.createProductRaw.bind(this));
    this.circuitBreakerService.create('updateProduct', this.updateProductRaw.bind(this));
    this.circuitBreakerService.create('removeProduct', this.removeProductRaw.bind(this));

    // Initialize rate limiters
    this.rateLimiterService.create('products', {
      maxRequests: 3,
      timeWindowMs: 60000, // 1 minute
    });
  }

  // Raw methods for circuit breaker
  private async findAllProductsRaw() {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.productServiceUrl}/products`).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(`Error fetching products: ${error.message}`);
          throw new HttpException(
            error.response?.data || 'Product service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }

  async findAll() {
    try {
      // Apply rate limiting
      return await this.rateLimiterService.execute('products', async () => {
        // Apply circuit breaker
        return await this.circuitBreakerService.execute('findAllProducts');
      });
    } catch (error) {
      this.logger.error(`Failed to fetch products: ${error.message}`);
      if (error.message.includes('Rate limit exceeded')) {
        throw new HttpException('Too many requests. Please try again later.', 429);
      }
      throw new HttpException(
        'Failed to fetch products. Please try again later.',
        error.status || 500,
      );
    }
  }

  private async findOneProductRaw(id: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.productServiceUrl}/products/${id}`).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(`Error fetching product ${id}: ${error.message}`);
          throw new HttpException(
            error.response?.data || 'Product service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }

  async findOne(id: string) {
    try {
      // Apply time limiter
      return await this.timeLimiterService.execute(
        async () => {
          // Apply retry with exponential backoff
          return await this.retryService.execute(
            async () => {
              // Apply circuit breaker
              return await this.circuitBreakerService.execute('findOneProduct', id);
            },
            {
              maxRetries: 3,
              delay: 1000,
              backoffFactor: 2,
              retryableErrors: [HttpException],
            },
          );
        },
        { timeoutMs: 5000 },
      );
    } catch (error) {
      this.logger.error(`Failed to fetch product ${id}: ${error.message}`);
      if (error.message.includes('Operation timed out')) {
        throw new HttpException('Request timed out. Please try again later.', 408);
      }
      throw new HttpException(
        'Failed to fetch product. Please try again later.',
        error.status || 500,
      );
    }
  }

  private async createProductRaw(createProductDto: any) {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.productServiceUrl}/products`, createProductDto).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(`Error creating product: ${error.message}`);
          throw new HttpException(
            error.response?.data || 'Product service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }

  async create(createProductDto: any) {
    try {
      // Apply circuit breaker
      return await this.circuitBreakerService.execute('createProduct', createProductDto);
    } catch (error) {
      this.logger.error(`Failed to create product: ${error.message}`);
      throw new HttpException(
        'Failed to create product. Please try again later.',
        error.status || 500,
      );
    }
  }

  private async updateProductRaw(id: string, updateProductDto: any) {
    const { data } = await firstValueFrom(
      this.httpService.patch(`${this.productServiceUrl}/products/${id}`, updateProductDto).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(`Error updating product ${id}: ${error.message}`);
          throw new HttpException(
            error.response?.data || 'Product service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }

  async update(id: string, updateProductDto: any) {
    try {
      // Apply retry with exponential backoff
      return await this.retryService.execute(
        async () => {
          // Apply circuit breaker
          return await this.circuitBreakerService.execute('updateProduct', id, updateProductDto);
        },
        {
          maxRetries: 2,
          delay: 500,
          backoffFactor: 2,
          retryableErrors: [HttpException],
        },
      );
    } catch (error) {
      this.logger.error(`Failed to update product ${id}: ${error.message}`);
      throw new HttpException(
        'Failed to update product. Please try again later.',
        error.status || 500,
      );
    }
  }

  private async removeProductRaw(id: string) {
    const { data } = await firstValueFrom(
      this.httpService.delete(`${this.productServiceUrl}/products/${id}`).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(`Error removing product ${id}: ${error.message}`);
          throw new HttpException(
            error.response?.data || 'Product service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }

  async remove(id: string) {
    try {
      // Apply rate limiting and circuit breaker
      return await this.rateLimiterService.execute('products', async () => {
        return await this.circuitBreakerService.execute('removeProduct', id);
      });
    } catch (error) {
      this.logger.error(`Failed to remove product ${id}: ${error.message}`);
      if (error.message.includes('Rate limit exceeded')) {
        throw new HttpException('Too many requests. Please try again later.', 429);
      }
      throw new HttpException(
        'Failed to remove product. Please try again later.',
        error.status || 500,
      );
    }
  }
}
