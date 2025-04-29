import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { FaultToleranceModule } from '../fault-tolerance/fault-tolerance.module';

@Module({
  imports: [HttpModule, FaultToleranceModule],
  controllers: [ProductsController],
  providers: [ProductsService]
})
export class ProductsModule {}
