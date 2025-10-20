import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutosModule } from './produtos/produtos.module';
import { Produto } from './produtos/entities/produto.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'user',
      password: process.env.DATABASE_PASSWORD || 'password',
      database: process.env.DATABASE_DB || 'crud_db',
      entities: [Produto], // Aponta diretamente para a nossa entidade
      synchronize: true, // Perfeito para desenvolvimento
    }),
    ProdutosModule,
  ],
})
export class AppModule {}