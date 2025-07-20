package br.com.csaserigy.subcomite.controller;

import br.com.csaserigy.subcomite.domain.usuario.Usuario;
import br.com.csaserigy.subcomite.dto.DtoEdicaoAdmin;
import br.com.csaserigy.subcomite.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/contato")
    public ResponseEntity<Map<String, String>> getContato() {
        // Busca o primeiro usuário (admin) que encontrar.
        var admin = usuarioRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Administrador não encontrado"));
        return ResponseEntity.ok(Map.of("telefone", admin.getTelefone()));
    }

    @PutMapping()
    @Transactional
    public ResponseEntity<Usuario> putAdmin(@RequestBody DtoEdicaoAdmin dados) {
        // Busca o primeiro usuário (admin) que encontrar.
        var admin = usuarioRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Administrador não encontrado"));
        if (dados.login() != null) {
            admin.setLogin(dados.login());
        }
        if (dados.senha() != null) {
            String senhaCodificada = passwordEncoder.encode(dados.senha());
            admin.setSenha(senhaCodificada);
        }
        if (dados.telefone() != null) {
            admin.setTelefone(dados.telefone());
        }
        return ResponseEntity.ok(admin);
    }
}