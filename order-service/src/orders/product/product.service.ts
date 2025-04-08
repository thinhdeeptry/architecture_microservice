import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Product } from '../interfaces/product.interface';

@Injectable()
export class ProductService {
  private productServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.productServiceUrl = this.configService.get<string>('PRODUCT_SERVICE_URL') || 'http://localhost:3000/api';
  }

  async getProductById(productId: string): Promise<Product> {
    try {
      const response = await fetch(`${this.productServiceUrl}/products/${productId}`);

      if (!response.ok) {
        throw new HttpException(
          `Failed to fetch product with ID ${productId}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      return await response.json();
    } catch (error) {
      throw new HttpException(
        `Error communicating with Product Service: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async checkProductsAvailability(items: { productId: string; quantity: number }[]): Promise<boolean> {
    try {
      const productPromises = items.map(item => this.getProductById(item.productId));
      const products = await Promise.all(productPromises);

      // Check if all products exist and have sufficient stock
      return products.every((product, index) => {
        const requestedQuantity = items[index].quantity;
        return product && product.stock >= requestedQuantity;
      });
    } catch (error) {
      throw new HttpException(
        `Error checking product availability: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
