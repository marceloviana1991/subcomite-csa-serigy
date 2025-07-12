package br.com.csaserigy.subcomite.domain.pedido;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_pedido")
    private LocalDateTime dataPedido;

    private String nome;
    private String telefone;

    @Column(name = "valor_total")
    private Float valorTotal;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<ItemPedido> itens = new ArrayList<>();

    private boolean confirmado = false;

    @PrePersist
    public void prePersist() {
        dataPedido = LocalDateTime.now();
    }
}
