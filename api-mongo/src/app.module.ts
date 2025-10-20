// src/app.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProdutosModule } from './produtos/produtos.module';

@Module({
  imports: [
    // Configuração da conexão com o MongoDB
    MongooseModule.forRootAsync({
      useFactory: () => ({
        // A string de conexão do MongoDB é um pouco diferente
        uri: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=admin`,
      }),
    }),
    ProdutosModule,
  ],
})
export class AppModule {}