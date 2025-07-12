package br.com.csaserigy.subcomite.repository;

import br.com.csaserigy.subcomite.domain.produto.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    Optional<Produto> findByImagemUUID(UUID imagemUUID);
}