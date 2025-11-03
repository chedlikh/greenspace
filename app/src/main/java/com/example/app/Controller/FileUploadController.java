package com.example.app.Controller;

import com.example.app.DTOs.MessageAttachmentDTO;
import com.example.app.Entities.User;
import com.example.app.Repository.UserRepo;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.ChatValidationService;
import com.example.app.Service.FileUploadService;
import com.example.app.Service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private ChatValidationService validationServices;
    @Autowired
    private MessageService validationService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new IllegalStateException("User not authenticated");
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
        return user.getId();
    }

    @PostMapping("/chat/image/{messageId}")
    public ResponseEntity<MessageAttachmentDTO> uploadChatImage(
            @RequestParam MultipartFile file,
            @PathVariable Long messageId) throws IOException {
        validationService.canUserAccessMessage(messageId, getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fileUploadService.uploadChatImage(file, messageId));
    }

    @PostMapping("/chat/voice/{messageId}")
    public ResponseEntity<MessageAttachmentDTO> uploadChatVoice(
            @RequestParam MultipartFile file,
            @PathVariable Long messageId) throws IOException {
        validationService.canUserAccessMessage(messageId, getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fileUploadService.uploadChatVoice(file, messageId));
    }

    @PostMapping("/chat/video/{messageId}")
    public ResponseEntity<MessageAttachmentDTO> uploadChatVideo(
            @RequestParam MultipartFile file,
            @PathVariable Long messageId) throws IOException {
        validationService.canUserAccessMessage(messageId, getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fileUploadService.uploadChatVideo(file, messageId));
    }

    @PostMapping("/chat/document/{messageId}")
    public ResponseEntity<MessageAttachmentDTO> uploadChatDocument(
            @RequestParam MultipartFile file,
            @PathVariable Long messageId) throws IOException {
        validationService.canUserAccessMessage(messageId, getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fileUploadService.uploadChatDocument(file, messageId));
    }

    @PostMapping("/group/image/{conversationId}")
    public ResponseEntity<String> uploadGroupImage(
            @RequestParam MultipartFile file,
            @PathVariable Long conversationId) throws IOException {
        validationServices.canUserAccessConversation(conversationId, getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fileUploadService.uploadGroupImage(file, conversationId));
    }

    @GetMapping("/{filePath}")
    public ResponseEntity<byte[]> getFile(@PathVariable String filePath) throws IOException {
        return ResponseEntity.ok(fileUploadService.getFileBytes(filePath));
    }

    @GetMapping("/url/{filePath}")
    public ResponseEntity<String> getFileUrl(@PathVariable String filePath) {
        return ResponseEntity.ok(fileUploadService.getFileUrl(filePath));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalStateException(IllegalStateException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<String> handleIOException(IOException ex) {
        return new ResponseEntity<>("File processing error: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}