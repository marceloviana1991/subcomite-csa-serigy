package br.com.csaserigy.subcomite.controller;

import br.com.csaserigy.subcomite.domain.produto.Produto;
import br.com.csaserigy.subcomite.dto.DtoAdicionarEstoque;
import br.com.csaserigy.subcomite.dto.DtoCadastroProduto;
import br.com.csaserigy.subcomite.dto.DtoEdicaoProduto;
import br.com.csaserigy.subcomite.dto.DtoRetornoProduto;
import br.com.csaserigy.subcomite.repository.ProdutoRepository;
import br.com.csaserigy.subcomite.service.FileStorageService;
import br.com.csaserigy.subcomite.service.ProdutoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/produtos")
@CrossOrigin(origins = "*")
public class ProdutoController {

    private final ProdutoRepository produtoRepository;
    private final ProdutoService produtoService;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;

    public ProdutoController(ProdutoRepository produtoRepository, ProdutoService produtoService, FileStorageService fileStorageService, ObjectMapper objectMapper) {
        this.produtoRepository = produtoRepository;
        this.produtoService = produtoService;
        this.fileStorageService = fileStorageService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<List<Produto>> listarProdutos() {
        return ResponseEntity.ok(produtoRepository.findAll());
    }

    @GetMapping("/api")
    public ResponseEntity<List<DtoRetornoProduto>> listarProdutosApi() {
        List<DtoRetornoProduto> produtosDto = produtoRepository.findAll()
                .stream()
                .map(DtoRetornoProduto::new) // Converte cada Produto para DtoRetornoProduto
                .collect(Collectors.toList()); // Coleta os resultados em uma nova lista
        return ResponseEntity.ok(produtosDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> detalharProduto(@PathVariable Long id) {
        Produto produto = produtoService.findById(id);
        return ResponseEntity.ok(produto);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<Produto> cadastrarProduto(@RequestParam("produto") String produtoJson,
                                                    @RequestParam("imagem") MultipartFile imagem,
                                                    UriComponentsBuilder uriBuilder) throws IOException {
        DtoCadastroProduto dto = objectMapper.readValue(produtoJson, DtoCadastroProduto.class);
        Produto produto = produtoService.cadastrar(dto, imagem);
        URI uri = uriBuilder.path("/produtos/{id}").buildAndExpand(produto.getId()).toUri();
        return ResponseEntity.created(uri).body(produto);
    }

    @GetMapping("/imagem/{uuid}")
    public ResponseEntity<Resource> carregarImagemProduto(@PathVariable UUID uuid) {
        Produto produto = produtoRepository.findByImagemUUID(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Imagem não encontrada para o UUID: " + uuid));

        // Tenta encontrar a imagem com diferentes extensões
        String[] extensoes = {"jpg", "jpeg", "png", "gif"};
        Resource resource = null;
        String contentType = null;

        for (String ext : extensoes) {
            try {
                String filename = produto.getImagemUUID() + "." + ext;
                resource = fileStorageService.loadFileAsResource(filename);
                if (resource.exists()) {
                    contentType = Files.probeContentType(resource.getFile().toPath());
                    break;
                }
            } catch (Exception e) {
                // Continua para a próxima extensão
            }
        }

        if (resource == null || !resource.exists()) {
            throw new RuntimeException("Arquivo de imagem não encontrado no servidor.");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
    }


    @PutMapping("/{id}/estoque")
    @Transactional
    public ResponseEntity<Produto> adicionarEstoque(@PathVariable Long id, @RequestBody @Valid DtoAdicionarEstoque dados) {
        Produto produto = produtoService.findById(id);
        produto.adicionarEstoque(dados.quantidade());
        return ResponseEntity.ok(produto);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> excluirProduto(@PathVariable Long id) {
        produtoService.excluir(id);
        return ResponseEntity.noContent().build();
    }


    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Produto> editarProduto(@PathVariable Long id,
                                                 @RequestParam("produto") String produtoJson,
                                                 @RequestParam(value = "imagem", required = false) MultipartFile imagem) throws IOException {
        // Desserializa a string JSON para o DTO de edição
        DtoEdicaoProduto dadosEdicao = objectMapper.readValue(produtoJson, DtoEdicaoProduto.class);

        Produto produtoAtualizado = produtoService.editar(id, dadosEdicao, imagem);
        return ResponseEntity.ok(produtoAtualizado);
    }
}
