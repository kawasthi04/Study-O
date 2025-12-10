package com.kushagra.studyo

import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Paths
import java.nio.file.StandardCopyOption

@RestController
@CrossOrigin(origins = ["*"]) // Allow React to talk to us
class UploadController {

    private val uploadDir = Paths.get("uploads")

    init {
        if (!Files.exists(uploadDir)) {
            Files.createDirectory(uploadDir)
        }
    }

    @PostMapping("/api/upload")
    fun uploadFile(@RequestParam("file") file: MultipartFile): Map<String, String> {
        val fileName = "${System.currentTimeMillis()}_${file.originalFilename}"
        val targetLocation = uploadDir.resolve(fileName)
        
        Files.copy(file.inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING)

        // Return the URL where the frontend can find this file
        // Note: In Docker, this is localhost:8081
        return mapOf("url" to "http://localhost:8081/uploads/$fileName")
    }
}