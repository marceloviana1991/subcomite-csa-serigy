package br.com.csaserigy.subcomite.dto;

import br.com.csaserigy.subcomite.domain.produto.Produto;

public record DtoRetornoProduto(
        Long id,
        String nome,
        Float preco,
        Integer estoque,
        String tipo,
        String imagem
) {
    public DtoRetornoProduto(Produto produto) {
        this(
                produto.getId(),
                produto.getNome(),
                produto.getPreco(),
                produto.getEstoque(),
                produto.getTipo().toString(),
                produto.getImagemUUID().toString()
        );
    }
}
