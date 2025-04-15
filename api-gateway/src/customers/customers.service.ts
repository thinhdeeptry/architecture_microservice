import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class CustomersService {
  private customerServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.customerServiceUrl = this.configService.get<string>('CUSTOMER_SERVICE_URL') || 'http://customer-service:3003/api';
  }

  async findAll() {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.customerServiceUrl}/customers`).pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(
            error.response?.data || 'Customer service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }

  async findOne(id: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.customerServiceUrl}/customers/${id}`).pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(
            error.response?.data || 'Customer service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }

  async create(createCustomerDto: any) {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.customerServiceUrl}/customers`, createCustomerDto).pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(
            error.response?.data || 'Customer service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }

  async update(id: string, updateCustomerDto: any) {
    const { data } = await firstValueFrom(
      this.httpService.patch(`${this.customerServiceUrl}/customers/${id}`, updateCustomerDto).pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(
            error.response?.data || 'Customer service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }

  async remove(id: string) {
    const { data } = await firstValueFrom(
      this.httpService.delete(`${this.customerServiceUrl}/customers/${id}`).pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(
            error.response?.data || 'Customer service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }
}
