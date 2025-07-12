package br.com.csaserigy.subcomite.controller;

import br.com.csaserigy.subcomite.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/contato")
    public ResponseEntity<Map<String, String>> getContato() {
        // Busca o primeiro usuário (admin) que encontrar.
        // Numa aplicação real, você teria uma lógica melhor para identificar o admin.
        var admin = usuarioRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Administrador não encontrado"));

        return ResponseEntity.ok(Map.of("telefone", admin.getTelefone()));
    }
}