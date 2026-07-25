package com.northmess.utils;

import com.northmess.config.AppProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Component
@RequiredArgsConstructor
public class FileUploadUtil {

    private final AppProperties appProperties;

    public String saveFile(MultipartFile file, String folder, String namePrefix) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
            String extension = "";
            int dot = originalFilename.lastIndexOf('.');
            if (dot >= 0) {
                extension = originalFilename.substring(dot);
            }

            String safePrefix = namePrefix.replaceAll("[^a-zA-Z0-9-_]", "_");
            String fileName = safePrefix + "-" + UUID.randomUUID() + extension;
            Path directory = Paths.get(appProperties.getUploadDir(), folder).toAbsolutePath().normalize();
            Files.createDirectories(directory);
            Path target = directory.resolve(fileName);
            file.transferTo(target);
            return "/uploads/" + folder + "/" + fileName;
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to store file", exception);
        }
    }

    public void deleteFile(String storedPath) {
        if (storedPath == null || storedPath.isBlank() || !storedPath.startsWith("/uploads/")) {
            return;
        }
        try {
            String relative = storedPath.substring("/uploads/".length());
            Path filePath = Paths.get(appProperties.getUploadDir(), relative).toAbsolutePath().normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
        }
    }
}