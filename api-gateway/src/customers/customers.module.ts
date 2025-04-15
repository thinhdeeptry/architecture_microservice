import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [HttpModule],
  controllers: [CustomersController],
  providers: [CustomersService]
})
export class CustomersModule {}
