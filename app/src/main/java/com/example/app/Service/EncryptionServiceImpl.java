package com.example.app.Service;

import com.example.app.Repository.ConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EncryptionServiceImpl implements EncryptionService {

    @Autowired
    private ConversationRepository conversationRepository;

    private final Map<Long, String> conversationKeys = new ConcurrentHashMap<>();

    @Override
    public String encryptMessageContent(String content, Long conversationId) {
        try {
            String key = getConversationKey(conversationId, null);
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encrypted = cipher.doFinal(content.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    @Override
    public String decryptMessageContent(String encryptedContent, Long conversationId) {
        try {
            String key = getConversationKey(conversationId, null);
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encryptedContent));
            return new String(decrypted);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }

    @Override
    public byte[] encryptFile(byte[] fileData, Long conversationId) {
        try {
            String key = getConversationKey(conversationId, null);
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            return cipher.doFinal(fileData);
        } catch (Exception e) {
            throw new RuntimeException("File encryption failed", e);
        }
    }

    @Override
    public byte[] decryptFile(byte[] encryptedFileData, Long conversationId) {
        try {
            String key = getConversationKey(conversationId, null);
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            return cipher.doFinal(encryptedFileData);
        } catch (Exception e) {
            throw new RuntimeException("File decryption failed", e);
        }
    }

    @Override
    public void generateConversationKey(Long conversationId) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(conversationId.toString().getBytes());
            String key = Base64.getEncoder().encodeToString(Arrays.copyOf(hash, 16)); // 128-bit key
            conversationKeys.put(conversationId, key);
        } catch (Exception e) {
            throw new RuntimeException("Key generation failed", e);
        }
    }

    @Override
    public String getConversationKey(Long conversationId, Long userId) {
        return conversationKeys.computeIfAbsent(conversationId, id -> {
            generateConversationKey(id);
            return conversationKeys.get(id);
        });
    }

    @Override
    public void rotateConversationKey(Long conversationId) {
        generateConversationKey(conversationId);
    }
}