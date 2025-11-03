package com.example.app.utils;
/*
import com.example.app.Service.FaceDetectionServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.bytedeco.javacv.Frame;
import org.bytedeco.javacv.Java2DFrameConverter;
import org.springframework.stereotype.Component;

import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.imageio.ImageIO;
/*
@Component
public class ImageUtils {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FaceDetectionServiceImpl.class);


    private static final int MIN_IMAGE_SIZE = 100; // Minimum width/height in pixels
    private static final int FACENET_SIZE = 160; // FaceNet input size
    private final Java2DFrameConverter converter = new Java2DFrameConverter();

    public boolean hasMinimumFaceSize(BufferedImage image) {
        return image.getWidth() >= MIN_IMAGE_SIZE && image.getHeight() >= MIN_IMAGE_SIZE;
    }

    public BufferedImage convertToGrayscale(BufferedImage image) {
        BufferedImage grayImage = new BufferedImage(
                image.getWidth(), image.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        for (int x = 0; x < image.getWidth(); x++) {
            for (int y = 0; y < image.getHeight(); y++) {
                int rgb = image.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;
                int gray = (int) (0.299 * r + 0.587 * g + 0.114 * b);
                grayImage.setRGB(x, y, (gray << 16) + (gray << 8) + gray);
            }
        }
        return grayImage;
    }

    public BufferedImage cropToFace(BufferedImage image, Rectangle faceRect) {
        int x = Math.max(0, faceRect.x);
        int y = Math.max(0, faceRect.y);
        int width = Math.min(faceRect.width, image.getWidth() - x);
        int height = Math.min(faceRect.height, image.getHeight() - y);
        return image.getSubimage(x, y, width, height);
    }

    public BufferedImage resizeForFaceRecognition(BufferedImage image) {
        BufferedImage resized = new BufferedImage(FACENET_SIZE, FACENET_SIZE, image.getType());
        java.awt.Graphics2D g = resized.createGraphics();
        g.drawImage(image.getScaledInstance(FACENET_SIZE, FACENET_SIZE, java.awt.Image.SCALE_SMOOTH),
                0, 0, null);
        g.dispose();
        return resized;
    }

    public BufferedImage normalizeIllumination(BufferedImage image) {
        // Basic histogram equalization (placeholder)
        return image;
    }

    public double calculateImageQuality(BufferedImage image) {
        // Placeholder: Implement sharpness, brightness, contrast checks
        return 0.85;
    }

    public byte[] bufferedImageToBytes(BufferedImage image, String format) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, format, baos);
            return baos.toByteArray();
        } catch (IOException e) {
            log.error("Failed to convert BufferedImage to bytes", e);
            throw new RuntimeException("Image conversion failed", e);
        }
    }

    public BufferedImage bytesToBufferedImage(byte[] bytes) {
        try {
            return ImageIO.read(new ByteArrayInputStream(bytes));
        } catch (IOException e) {
            log.error("Failed to convert bytes to BufferedImage", e);
            throw new RuntimeException("Image conversion failed", e);
        }
    }

    public Frame bufferedImageToFrame(BufferedImage image) {
        return converter.convert(image);
    }
}

 */