package com.example.app.Service;
/*
import com.example.app.utils.ImageUtils;
import lombok.RequiredArgsConstructor;
import org.bytedeco.javacv.OpenCVFrameConverter;
import org.bytedeco.opencv.opencv_core.Mat;
import org.bytedeco.opencv.opencv_core.Rect;
import org.bytedeco.opencv.opencv_core.RectVector;
import org.bytedeco.opencv.opencv_objdetect.CascadeClassifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.bytedeco.opencv.global.opencv_imgcodecs.imencode;
import static org.bytedeco.opencv.global.opencv_imgproc.COLOR_BGR2GRAY;
import static org.bytedeco.opencv.global.opencv_imgproc.cvtColor;

@Service
public class FaceDetectionServiceImpl implements FaceDetectionService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FaceDetectionServiceImpl.class);

    private final CascadeClassifier faceDetector;
    private final ImageUtils imageUtils;
    private final OpenCVFrameConverter.ToMat converter = new OpenCVFrameConverter.ToMat();
    public FaceDetectionServiceImpl(CascadeClassifier faceDetector, ImageUtils imageUtils) {
        this.faceDetector = faceDetector;
        this.imageUtils = imageUtils;
    }
    @Value("${face.recognition.min-face-size:80}")
    private int minFaceSize;

    @Value("${face.recognition.max-faces:1}")
    private int maxFaces;

    @Override
    public FaceDetectionResult detectFaces(BufferedImage image) {
        if (image == null) {
            return new FaceDetectionResult(false, 0, new ArrayList<>(), 0.0, "Image is null");
        }

        try {
            // Validate image size
            if (!imageUtils.hasMinimumFaceSize(image)) {
                return new FaceDetectionResult(false, 0, new ArrayList<>(), 0.0,
                        "Image too small for face detection");
            }

            // Convert to grayscale
            BufferedImage grayImage = imageUtils.convertToGrayscale(image);
            Mat matImage = converter.convertToMat(imageUtils.bufferedImageToFrame(grayImage));

            // Convert to grayscale Mat
            Mat grayMat = new Mat();
            cvtColor(matImage, grayMat, COLOR_BGR2GRAY);

            // Detect faces
            RectVector faces = new RectVector();
            faceDetector.detectMultiScale(grayMat, faces);

            List<Rectangle> faceRectangles = new ArrayList<>();
            for (int i = 0; i < faces.size(); i++) {
                Rect rect = faces.get(i);
                faceRectangles.add(new Rectangle(rect.x(), rect.y(), rect.width(), rect.height()));
            }

            if (faceRectangles.isEmpty()) {
                return new FaceDetectionResult(false, 0, faceRectangles, 0.0, "No faces detected");
            }

            if (faceRectangles.size() > maxFaces) {
                return new FaceDetectionResult(true, (int) faces.size(), faceRectangles, 0.5,
                        "Multiple faces detected. Only one face allowed.");
            }

            // Calculate confidence based on face size and position
            Rectangle mainFace = faceRectangles.get(0);
            double confidence = calculateFaceConfidence(mainFace, image.getWidth(), image.getHeight());

            String message = confidence >= 0.8 ? "Face detected with high confidence" :
                    confidence >= 0.6 ? "Face detected with medium confidence" :
                            "Face detected with low confidence";

            return new FaceDetectionResult(true, 1, faceRectangles, confidence, message);

        } catch (Exception e) {
            log.error("Error during face detection", e);
            return new FaceDetectionResult(false, 0, new ArrayList<>(), 0.0,
                    "Face detection error: " + e.getMessage());
        }
    }

    private double calculateFaceConfidence(Rectangle face, int imageWidth, int imageHeight) {
        double confidence = 1.0;

        // Check face size (20-80% of image)
        int minDimension = Math.min(imageWidth, imageHeight);
        double faceSize = Math.min(face.width, face.height);
        double sizeRatio = faceSize / minDimension;

        if (sizeRatio < 0.2) confidence *= 0.6;
        else if (sizeRatio > 0.8) confidence *= 0.7;
        else if (sizeRatio >= 0.3 && sizeRatio <= 0.6) confidence *= 1.0;
        else confidence *= 0.9;

        // Check centering
        int faceCenterX = face.x + face.width / 2;
        int faceCenterY = face.y + face.height / 2;
        int imageCenterX = imageWidth / 2;
        int imageCenterY = imageHeight / 2;

        double distanceFromCenter = Math.sqrt(
                Math.pow(faceCenterX - imageCenterX, 2) +
                        Math.pow(faceCenterY - imageCenterY, 2)
        );
        double maxDistance = Math.sqrt(Math.pow(imageWidth / 2, 2) + Math.pow(imageHeight / 2, 2));
        double centeringRatio = 1.0 - (distanceFromCenter / maxDistance);

        if (centeringRatio < 0.3) confidence *= 0.7;
        else if (centeringRatio >= 0.7) confidence *= 1.0;
        else confidence *= 0.9;

        return Math.max(0.0, Math.min(1.0, confidence));
    }
}
*/
