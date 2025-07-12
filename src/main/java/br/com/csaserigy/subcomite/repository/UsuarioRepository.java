package br.com.csaserigy.subcomite.repository;

import br.com.csaserigy.subcomite.domain.usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Método que o Spring Security usará para buscar um usuário pelo login
    UserDetails findByLogin(String login);
}