// src/produtos/schemas/produto.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProdutoDocument = HydratedDocument<Produto>;

@Schema()
export class Produto {
  // O Mongoose cria o _id automaticamente, não precisamos declarar

  @Prop({ required: true })
  nome: string;

  @Prop()
  descricao: string;

  @Prop({ required: true })
  preco: number;

  @Prop({ required: true })
  estoque: number;
}

export const ProdutoSchema = SchemaFactory.createForClass(Produto);