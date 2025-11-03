package com.example.app.configuration;

import org.apache.commons.io.FileUtils;
import org.bytedeco.opencv.opencv_objdetect.CascadeClassifier;
import org.nd4j.common.io.ClassPathResource;
import org.nd4j.common.io.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.tensorflow.SavedModelBundle;


import java.io.File;
import java.io.IOException;
import java.io.InputStream;

@Configuration
@EnableScheduling
public class FaceRecognitionConfig {
/*
    @Value("${opencv.cascade.path}")
    private String cascadePath;

    @Bean
    public CascadeClassifier faceDetector() {
        try {
            Resource resource = new ClassPathResource("haarcascades/haarcascade_frontalface_default.xml");
            InputStream inputStream = resource.getInputStream();

            // Create a temporary file
            File tempFile = File.createTempFile("haarcascade", ".xml");
            FileUtils.copyInputStreamToFile(inputStream, tempFile);
            tempFile.deleteOnExit();

            return new CascadeClassifier(tempFile.getAbsolutePath());
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load cascade file from: " + cascadePath, e);
        }
    }

    @Value("${face.net.model.path}")
    private String modelPath;

    @Bean
    public SavedModelBundle faceNetModel() throws IOException {
        String fullPath = new ClassPathResource(modelPath).getFile().getParent();
        return SavedModelBundle.load(fullPath, "serve");
    }

 */
}
