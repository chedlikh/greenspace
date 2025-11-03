package com.example.app.Service;

import java.awt.image.BufferedImage;

/**
 * Service interface for encoding a face image into a feature vector.
 */
public interface FaceEncodingService {

    byte[] encodeFace(BufferedImage faceImage);

    double compareEncodings(byte[] encoding1, byte[] encoding2);
}
