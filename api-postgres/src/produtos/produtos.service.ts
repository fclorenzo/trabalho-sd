// src/produtos/produtos.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { Produto } from './entities/produto.entity';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,
  ) {}

  async create(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    const produto = this.produtoRepository.create(createProdutoDto);
    return this.produtoRepository.save(produto);
  }

  async findAll(): Promise<Produto[]> {
    return this.produtoRepository.find();
  }


  async findOne(id: string): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({ where: { id } });
    if (!produto) {
      throw new NotFoundException(`Produto com o ID "${id}" não encontrado.`);
    }
    return produto;
  }

  async update(id: string, updateProdutoDto: UpdateProdutoDto): Promise<Produto> {
    const produto = await this.findOne(id);
    Object.assign(produto, updateProdutoDto);
    return this.produtoRepository.save(produto);
  }

  async remove(id: string): Promise<any> {
    const produto = await this.findOne(id);
    await this.produtoRepository.remove(produto);
    return { message: `Produto com o ID "${id}" deletado com sucesso.` };
  }

  async findRandom(): Promise<Produto> {
    const produto = await this.produtoRepository
      .createQueryBuilder('produto')
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();
    
    if (!produto) {
      throw new NotFoundException('Nenhum produto encontrado no banco.');
    }
    return produto;
  }
}
