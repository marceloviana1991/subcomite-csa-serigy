package br.com.csaserigy.subcomite.service;

import br.com.csaserigy.subcomite.domain.pedido.ItemPedido;
import br.com.csaserigy.subcomite.domain.pedido.Pedido;
import br.com.csaserigy.subcomite.domain.produto.Produto;
import br.com.csaserigy.subcomite.dto.DtoCadastroPedido;
import br.com.csaserigy.subcomite.dto.DtoItemPedido;
import br.com.csaserigy.subcomite.repository.PedidoRepository;
import br.com.csaserigy.subcomite.repository.ProdutoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;

    public PedidoService(PedidoRepository pedidoRepository, ProdutoRepository produtoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
    }

    @Transactional
    public Pedido cadastrar(DtoCadastroPedido dados) {
        Pedido pedido = new Pedido();
        float valorTotal = 0f;

        for (DtoItemPedido itemDto : dados.itens()) {
            Produto produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + itemDto.produtoId()));

            produto.removerEstoque(itemDto.quantidade());

            ItemPedido itemPedido = new ItemPedido();
            itemPedido.setPedido(pedido);
            itemPedido.setProduto(produto);
            itemPedido.setQuantidade(itemDto.quantidade());
            itemPedido.setPrecoUnitario(produto.getPreco());

            pedido.getItens().add(itemPedido);
            valorTotal += itemDto.quantidade() * produto.getPreco();
        }

        pedido.setValorTotal(valorTotal);
        pedido.setNome(dados.nome());
        pedido.setTelefone(dados.telefone());
        return pedidoRepository.save(pedido);
    }

    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    public Pedido buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com o ID: " + id));
    }

    @Transactional
    public Pedido confirmar(Long id) {
        Pedido pedido = pedidoRepository
                .findById(id).orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com o ID: " + id));
        pedido.setConfirmado(true);
        return pedido;

    }

    @Transactional
    public void cancelar(Long id) {
        Pedido pedido = pedidoRepository
                .findById(id).orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado com o ID: " + id));
        pedido.getItens().forEach(item -> {
            Produto produto = produtoRepository
                    .findById(item.getProduto().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID: " + item.getProduto().getId()));
            produto.setEstoque(produto.getEstoque() + item.getQuantidade());
        });
        pedidoRepository.delete(pedido);
    }

    public List<Pedido> listarPorMesEAno(int mes, int ano) {
        return pedidoRepository.findByAnoEMes(ano, mes);
    }
}
