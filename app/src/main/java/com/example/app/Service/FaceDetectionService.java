package com.example.app.Service;

import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.util.List;

/**
 * Service interface for detecting faces in an image.
 */
public interface FaceDetectionService {

    FaceDetectionResult detectFaces(BufferedImage image);

    class FaceDetectionResult {
        private final boolean faceDetected;
        private final int faceCount;
        private final List<Rectangle> faceRectangles;
        private final double confidence;
        private final String message;

        public FaceDetectionResult(boolean faceDetected, int faceCount, List<Rectangle> faceRectangles,
                                   double confidence, String message) {
            this.faceDetected = faceDetected;
            this.faceCount = faceCount;
            this.faceRectangles = faceRectangles;
            this.confidence = confidence;
            this.message = message;
        }

        public boolean isFaceDetected() {
            return faceDetected;
        }

        public int getFaceCount() {
            return faceCount;
        }

        public List<Rectangle> getFaceRectangles() {
            return faceRectangles;
        }

        public double getConfidence() {
            return confidence;
        }

        public String getMessage() {
            return message;
        }

        public boolean isValid() {
            return faceDetected && faceCount == 1 && confidence >= 0.7;
        }
    }
}