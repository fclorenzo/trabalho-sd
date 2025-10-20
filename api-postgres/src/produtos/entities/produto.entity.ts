// src/produtos/entities/produto.entity.ts

import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'produtos' }) // Define o nome da tabela como 'produtos'
export class Produto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column('text')
  descricao: string;

  @Column('float')
  preco: number;

  @Column('int')
  estoque: number;
}