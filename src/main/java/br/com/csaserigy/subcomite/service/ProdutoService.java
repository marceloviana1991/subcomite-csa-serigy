package br.com.csaserigy.subcomite.service;

import br.com.csaserigy.subcomite.domain.produto.Produto;
import br.com.csaserigy.subcomite.domain.produto.TipoProduto;
import br.com.csaserigy.subcomite.dto.DtoCadastroProduto;
import br.com.csaserigy.subcomite.dto.DtoEdicaoProduto;
import br.com.csaserigy.subcomite.repository.ProdutoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final FileStorageService fileStorageService;

    public ProdutoService(ProdutoRepository produtoRepository, FileStorageService fileStorageService) {
        this.produtoRepository = produtoRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public Produto cadastrar(DtoCadastroProduto dados, MultipartFile imagem) {
        UUID imagemUUID = fileStorageService.storeFile(imagem);

        Produto produto = new Produto();
        produto.setNome(dados.nome());
        produto.setPreco(dados.preco());
        produto.setEstoque(dados.estoque());
        produto.setTipo(dados.tipo());
        produto.setImagemUUID(imagemUUID);

        return produtoRepository.save(produto);
    }

    public Produto findById(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado com o ID: " + id));
    }


    @Transactional
    public void excluir(Long id) {
        // 1. Busca o produto ou lança uma exceção se não encontrar
        Produto produto = this.findById(id);

        // 2. Guarda o UUID da imagem antes de deletar o produto
        UUID imagemUUID = produto.getImagemUUID();

        // 3. Deleta o produto do banco de dados
        produtoRepository.delete(produto);

        // 4. Deleta o arquivo de imagem associado
        fileStorageService.deleteFile(imagemUUID);
    }

    @Transactional
    public Produto editar(Long id, DtoEdicaoProduto dados, MultipartFile imagem) {
        Produto produto = this.findById(id);

        // Atualiza os dados textuais se eles foram fornecidos
        if (dados.nome() != null && !dados.nome().isBlank()) {
            produto.setNome(dados.nome());
        }
        if (dados.preco() != null && dados.preco() > 0) {
            produto.setPreco(dados.preco());
        }

        // Verifica se uma nova imagem foi enviada
        if (imagem != null && !imagem.isEmpty()) {
            // Deleta a imagem antiga
            fileStorageService.deleteFile(produto.getImagemUUID());
            // Salva a nova imagem e atualiza o UUID no produto
            UUID novoImagemUUID = fileStorageService.storeFile(imagem);
            produto.setImagemUUID(novoImagemUUID);
        }

        // O JPA/Hibernate salva as alterações automaticamente ao final da transação
        return produto;
    }

}
