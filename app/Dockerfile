
# Stage 1: Build the application
FROM maven:3.8.5-openjdk-17 AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM openjdk:17-jre-slim
WORKDIR /app
COPY --from=builder /app/target/app-0.0.1-SNAPSHOT.jar app-0.0.1-SNAPSHOT.jar
ENV JAVA_OPTS="-Djdk.tls.client.protocols=TLSv1.2 -Dfile.encoding=UTF-8"
EXPOSE 8089
ENTRYPOINT ["java", "-jar", "app-0.0.1-SNAPSHOT.jar"]
