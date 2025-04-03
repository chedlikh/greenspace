
# Stage 1: Build the application
FROM maven:3.8.5-openjdk-17 AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests
RUN ping -c 4 repo.maven.apache.org || echo "Maven Central not reachable"

# Stage 2: Run the application
FROM openjdk:17
WORKDIR /app
COPY --from=builder /app/target/app.jar app.jar
EXPOSE 8089
ENTRYPOINT ["java", "-jar", "app.jar"]
