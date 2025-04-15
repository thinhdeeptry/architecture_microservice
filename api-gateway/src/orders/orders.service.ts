import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class OrdersService {
  private orderServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.orderServiceUrl = this.configService.get<string>('ORDER_SERVICE_URL') || 'http://order-service:3001/api';
  }

  async findAll() {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.orderServiceUrl}/orders`).pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(
            error.response?.data || 'Order service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }

  async findOne(id: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.orderServiceUrl}/orders/${id}`).pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(
            error.response?.data || 'Order service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }

  async create(createOrderDto: any) {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.orderServiceUrl}/orders`, createOrderDto).pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(
            error.response?.data || 'Order service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }

  async update(id: string, updateOrderDto: any) {
    const { data } = await firstValueFrom(
      this.httpService.patch(`${this.orderServiceUrl}/orders/${id}`, updateOrderDto).pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(
            error.response?.data || 'Order service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }

  async remove(id: string) {
    const { data } = await firstValueFrom(
      this.httpService.delete(`${this.orderServiceUrl}/orders/${id}`).pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(
            error.response?.data || 'Order service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }
}
