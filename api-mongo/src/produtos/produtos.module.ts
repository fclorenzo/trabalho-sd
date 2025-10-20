// src/produtos/produtos.module.ts

import { Module } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { ProdutosController } from './produtos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Produto, ProdutoSchema } from './schemas/produto.schema'; // Importe o schema

@Module({
  imports: [
    // Registra o schema no módulo
    MongooseModule.forFeature([{ name: Produto.name, schema: ProdutoSchema }]),
  ],
  controllers: [ProdutosController],
  providers: [ProdutosService],
})
export class ProdutosModule {}