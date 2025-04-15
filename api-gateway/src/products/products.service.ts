import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ProductsService {
  private productServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.productServiceUrl = this.configService.get<string>('PRODUCT_SERVICE_URL') || 'http://product-service:3000/api';
  }

  async findAll() {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.productServiceUrl}/products`).pipe(
        catchError((error: AxiosError) => {
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
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.productServiceUrl}/products/${id}`).pipe(
        catchError((error: AxiosError) => {
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
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.productServiceUrl}/products`, createProductDto).pipe(
        catchError((error: AxiosError) => {
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
    const { data } = await firstValueFrom(
      this.httpService.patch(`${this.productServiceUrl}/products/${id}`, updateProductDto).pipe(
        catchError((error: AxiosError) => {
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
    const { data } = await firstValueFrom(
      this.httpService.delete(`${this.productServiceUrl}/products/${id}`).pipe(
        catchError((error: AxiosError) => {
          throw new HttpException(
            error.response?.data || 'Product service unavailable',
            error.response?.status || 500,
          );
        }),
      ),
    );
    return data;
  }
}
