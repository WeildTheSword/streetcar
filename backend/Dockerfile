# SCRUM-97: Container image for the Spring Boot API, deployed on Render.
# Two stages: the JDK image builds the jar with the Maven wrapper, and only
# the jar is copied into a smaller JRE image that runs it as a non-root user.

# ---- Build stage -----------------------------------------------------------
FROM eclipse-temurin:17-jdk AS build
WORKDIR /workspace

# The wrapper and POM first, so the dependency download is its own layer and
# is reused while only source files change.
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw -B -q dependency:resolve

COPY src src
# Tests run in CI before any deploy, so the image build skips them.
RUN ./mvnw -B -DskipTests package \
    && cp target/backend-*.jar /workspace/app.jar

# ---- Run stage -------------------------------------------------------------
FROM eclipse-temurin:17-jre
RUN groupadd --system streetcar \
    && useradd --system --gid streetcar --home-dir /app --no-create-home streetcar
WORKDIR /app
COPY --from=build --chown=streetcar:streetcar /workspace/app.jar app.jar
# Without DB_URL the app falls back to an H2 file in ./data, so the user must
# own the working directory to create it.
RUN chown streetcar:streetcar /app
USER streetcar

# Listen on every interface inside the container. Render routes traffic to
# whatever PORT it sets, and server.port reads PORT (default 8080).
ENV SERVER_ADDRESS=0.0.0.0
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
