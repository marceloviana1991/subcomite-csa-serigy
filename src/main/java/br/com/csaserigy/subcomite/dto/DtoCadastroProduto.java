package br.com.csaserigy.subcomite.dto;

import br.com.csaserigy.subcomite.domain.produto.TipoProduto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record DtoCadastroProduto(
        @NotBlank String nome,
        @NotNull @Positive Float preco,
        @NotNull @PositiveOrZero Integer estoque,
        @NotNull TipoProduto tipo
) {}
