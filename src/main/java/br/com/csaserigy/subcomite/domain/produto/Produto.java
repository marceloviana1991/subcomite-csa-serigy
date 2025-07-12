package br.com.csaserigy.subcomite.domain.produto;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "produtos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private Float preco;
    private Integer estoque;
    private UUID imagemUUID;
    @Enumerated(EnumType.STRING) // <-- IMPORTANTE: Salva o nome do enum como String
    @Column(name = "tipo")
    private TipoProduto tipo;

    public void adicionarEstoque(int quantidade) {
        if (quantidade > 0) {
            this.estoque += quantidade;
        }
    }

    public void removerEstoque(int quantidade) {
        if (this.estoque >= quantidade) {
            this.estoque -= quantidade;
        } else {
            throw new IllegalArgumentException("Estoque insuficiente para o produto: " + this.nome);
        }
    }
}