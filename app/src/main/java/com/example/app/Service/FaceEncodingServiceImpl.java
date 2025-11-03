package com.example.app.Service;

import com.example.app.utils.ImageUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bytedeco.opencv.opencv_core.Mat;
import org.bytedeco.opencv.global.opencv_imgcodecs;
import org.bytedeco.opencv.global.opencv_imgproc;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.tensorflow.Graph;
import org.tensorflow.Session;
import org.tensorflow.Tensor;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.nio.FloatBuffer;

import static org.bytedeco.opencv.global.opencv_core.CV_32F;
import static org.bytedeco.opencv.global.opencv_imgproc.COLOR_BGR2RGB;
/*
@Service
@Slf4j
@RequiredArgsConstructor
public class FaceEncodingServiceImpl implements FaceEncodingService {

    private final Session faceNetSession;
    private final ImageUtils imageUtils;

    @Value("${face.recognition.encoding.dimension:128}")
    private int encodingDimension;

    @Override
    public byte[] encodeFace(BufferedImage faceImage) {
        if (faceImage == null) {
            throw new IllegalArgumentException("Face image cannot be null");
        }

        try {
            // Preprocess image
            float[][][][] inputArray = preprocessImage(faceImage);

            // Create TensorFlow tensor (TensorFlow 0.4.0)
            long[] shape = new long[]{1, 160, 160, 3};
            float[] flatInput = new float[1 * 160 * 160 * 3];
            int index = 0;
            for (int i = 0; i < 160; i++) {
                for (int j = 0; j < 160; j++) {
                    for (int c = 0; c < 3; c++) {
                        flatInput[index++] = inputArray[0][i][j][c];
                    }
                }
            }
            try (Tensor inputTensor = Tensor.(shape, Float.class, flatInput)) {
                // Run inference
                Tensor outputTensor = faceNetSession.runner()
                        .feed("input:0", inputTensor)
                        .fetch("embeddings:0")
                        .run()
                        .get(0);

                // Extract embeddings
                float[] embeddings = new float[encodingDimension];
                long[] outputShape = outputTensor.shape();
                if (outputShape.length == 2 && outputShape[0] == 1 && outputShape[1] == encodingDimension) {
                    float[] outputData = new float[(int) (outputShape[0] * outputShape[1])];
                    outputTensor.copyTo(outputData);
                    System.arraycopy(outputData, 0, embeddings, 0, encodingDimension);
                } else {
                    throw new IllegalStateException("Unexpected output tensor shape: " + java.util.Arrays.toString(outputShape));
                }

                // Convert to byte array
                ByteBuffer byteBuffer = ByteBuffer.allocate(embeddings.length * Float.BYTES);
                for (float value : embeddings) {
                    byteBuffer.putFloat(value);
                }
                return byteBuffer.array();
            }
        } catch (Exception e) {
            log.error("Error encoding face", e);
            throw new RuntimeException("Failed to encode face: " + e.getMessage());
        }
    }

    @Override
    public double compareEncodings(byte[] encoding1, byte[] encoding2) {
        if (encoding1 == null || encoding2 == null) {
            throw new IllegalArgumentException("Encodings cannot be null");
        }

        float[] vector1 = byteArrayToFloatArray(encoding1);
        float[] vector2 = byteArrayToFloatArray(encoding2);

        // Cosine similarity
        double dotProduct = 0.0;
        double norm1 = 0.0;
        double norm2 = 0.0;
        for (int i = 0; i < vector1.length; i++) {
            dotProduct += vector1[i] * vector2[i];
            norm1 += vector1[i] * vector1[i];
            norm2 += vector2[i] * vector2[i];
        }
        norm1 = Math.sqrt(norm1);
        norm2 = Math.sqrt(norm2);

        if (norm1 == 0 || norm2 == 0) {
            return 0.0;
        }

        return dotProduct / (norm1 * norm2);
    }

    private float[][][][] preprocessImage(BufferedImage image) {
        // Convert BufferedImage to OpenCV Mat
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            javax.imageio.ImageIO.write(image, "jpg", baos);
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert BufferedImage to bytes", e);
        }
        Mat matImage = opencv_imgcodecs.imdecode(new Mat(baos.toByteArray()), opencv_imgcodecs.IMREAD_COLOR);

        // Resize to 160x160 (FaceNet input size)
        Mat resized = new Mat();
        opencv_imgproc.resize(matImage, resized, new org.bytedeco.opencv.opencv_core.Size(160, 160));

        // Convert BGR to RGB
        Mat rgbImage = new Mat();
        opencv_imgproc.cvtColor(resized, rgbImage, COLOR_BGR2RGB);

        // Convert to float and normalize to [-1, 1]
        Mat floatImage = new Mat();
        rgbImage.convertTo(floatImage, CV_32F, 2.0 / 255.0, -1.0);

        // Convert to float[][][][] for TensorFlow (batch, height, width, channels)
        float[][][][] result = new float[1][160][160][3];
        FloatBuffer floatBuffer = floatImage.createBuffer();
        for (int i = 0; i < 160; i++) {
            for (int j = 0; j < 160; j++) {
                int index = (i * 160 + j) * 3;
                result[0][i][j][0] = floatBuffer.get(index);     // R
                result[0][i][j][1] = floatBuffer.get(index + 1); // G
                result[0][i][j][2] = floatBuffer.get(index + 2); // B
            }
        }

        // Release resources
        matImage.release();
        resized.release();
        rgbImage.release();
        floatImage.release();

        return result;
    }

    private float[] byteArrayToFloatArray(byte[] bytes) {
        ByteBuffer buffer = ByteBuffer.wrap(bytes);
        float[] result = new float[bytes.length / Float.BYTES];
        for (int i = 0; i < result.length; i++) {
            result[i] = buffer.getFloat();
        }
        return result;
    }
}
*/