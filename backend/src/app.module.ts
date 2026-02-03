import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { ProductController } from './infrastructure/controllers/product.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_DATABASE', 'wompi_payment'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Only for development!
      }),
      inject: [ConfigService],
    }),
    InfrastructureModule,
  ],
  controllers: [ProductController],
  providers: [],
})
export class AppModule { }
