package br.com.csaserigy.subcomite.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record DtoCadastroPedido(
        @NotEmpty @Valid List<DtoItemPedido> itens
) {}