package br.com.csaserigy.subcomite.controller;

import br.com.csaserigy.subcomite.domain.pedido.Pedido;
import br.com.csaserigy.subcomite.dto.DtoCadastroPedido;
import br.com.csaserigy.subcomite.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<Pedido> cadastrarPedido(@RequestBody @Valid DtoCadastroPedido dados, UriComponentsBuilder uriBuilder) {
        Pedido pedido = pedidoService.cadastrar(dados);
        URI uri = uriBuilder.path("/pedidos/{id}").buildAndExpand(pedido.getId()).toUri();
        return ResponseEntity.created(uri).body(pedido);
    }

    @GetMapping
    public ResponseEntity<List<Pedido>> listarPedidos() {
        List<Pedido> pedidos = pedidoService.listarTodos();
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> detalharPedido(@PathVariable Long id) {
        Pedido pedido = pedidoService.buscarPorId(id);
        return ResponseEntity.ok(pedido);
    }

    @GetMapping("/filtrar")
    public ResponseEntity<List<Pedido>> listarPedidosPorMesEAno(
            @RequestParam("mes") int mes,
            @RequestParam("ano") int ano) {
        List<Pedido> pedidosFiltrados = pedidoService.listarPorMesEAno(mes, ano);
        return ResponseEntity.ok(pedidosFiltrados);
    }

    @PutMapping("/confirmar/{id}")
    public ResponseEntity<Pedido> confirmarPedido(@PathVariable Long id) {
        Pedido pedido = pedidoService.confirmar(id);
        return ResponseEntity.ok(pedido);
    }

    @DeleteMapping("/cancelar/{id}")
    public ResponseEntity<?> cancelarPedido(@PathVariable Long id) {
        pedidoService.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}
