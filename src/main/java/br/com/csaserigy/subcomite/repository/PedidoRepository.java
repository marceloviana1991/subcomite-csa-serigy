package br.com.csaserigy.subcomite.repository;

import br.com.csaserigy.subcomite.domain.pedido.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    @Query("SELECT p FROM Pedido p WHERE YEAR(p.dataPedido) = :ano AND MONTH(p.dataPedido) = :mes")
    List<Pedido> findByAnoEMes(@Param("ano") int ano, @Param("mes") int mes);
}