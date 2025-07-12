package br.com.csaserigy.subcomite.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record DtoAdicionarEstoque(
        @NotNull @Positive Integer quantidade
) {}
