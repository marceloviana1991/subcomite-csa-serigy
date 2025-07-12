package br.com.csaserigy.subcomite.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record DtoCadastroPedido(
        @NotBlank String nome,
        @NotBlank String telefone,
        @NotEmpty @Valid List<DtoItemPedido> itens
) {}