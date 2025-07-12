package br.com.csaserigy.subcomite.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Não foi possível criar o diretório para upload de arquivos.", ex);
        }
    }

    public UUID storeFile(MultipartFile file) {
        try {
            UUID uuid = UUID.randomUUID();
            String fileExtension = getFileExtension(file.getOriginalFilename());
            String newFileName = uuid + "." + fileExtension;

            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return uuid;
        } catch (IOException ex) {
            throw new RuntimeException("Não foi possível armazenar o arquivo.", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("Arquivo não encontrado: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("Arquivo não encontrado: " + fileName, ex);
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf('.') == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1);
    }

    public void deleteFile(UUID uuid) {
        if (uuid == null) return;

        String[] extensoes = {"jpg", "jpeg", "png", "gif"};
        for (String ext : extensoes) {
            try {
                String filename = uuid.toString() + "." + ext;
                Path filePath = this.fileStorageLocation.resolve(filename).normalize();
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                    // Arquivo encontrado e deletado, podemos sair do loop
                    return;
                }
            } catch (IOException ex) {
                // Log do erro é uma boa prática, mas continuamos para não parar a execução
                System.err.println("Erro ao tentar deletar o arquivo: " + uuid + "." + ext);
            }
        }
    }
}