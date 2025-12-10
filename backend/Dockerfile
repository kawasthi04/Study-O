FROM gradle:8-jdk17 AS builder
WORKDIR /app

COPY proto ./proto

COPY backend ./backend

WORKDIR /app/backend

RUN ./gradlew clean build -x test --no-daemon

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/backend/build/libs/*.jar app.jar

EXPOSE 9090
ENTRYPOINT ["java", "-jar", "app.jar"]