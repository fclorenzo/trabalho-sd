// src/produtos/produtos.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { Produto } from './schemas/produto.schema';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectModel(Produto.name) private produtoModel: Model<Produto>,
  ) {}

  async create(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    const createdProduto = new this.produtoModel(createProdutoDto);
    return createdProduto.save();
  }

  async findAll(): Promise<Produto[]> {
    return this.produtoModel.find().exec();
  }

  async findOne(id: string): Promise<Produto> {
    const produto = await this.produtoModel.findById(id).exec();
    if (!produto) {
      throw new NotFoundException(`Produto com o ID "${id}" não encontrado.`);
    }
    return produto;
  }

  async update(id: string, updateProdutoDto: UpdateProdutoDto): Promise<Produto> {
    const updatedProduto = await this.produtoModel.findByIdAndUpdate(id, updateProdutoDto, { new: true }).exec();
    if (!updatedProduto) {
      throw new NotFoundException(`Produto com o ID "${id}" não encontrado.`);
    }
    return updatedProduto;
  }

  async remove(id: string): Promise<any> {
    // Usando o método correto: findByIdAndDelete
    const result = await this.produtoModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Produto com o ID "${id}" não encontrado.`);
    }
    return { message: `Produto com o ID "${id}" deletado com sucesso.` };
  }

  async findRandom(): Promise<Produto> {
    const count = await this.produtoModel.countDocuments().exec();
    if (count === 0) {
      throw new NotFoundException('Nenhum produto encontrado no banco.');
    }
    const random = Math.floor(Math.random() * count);
    const produto = await this.produtoModel.findOne().skip(random).exec();
    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }
    return produto;
  }
}