package com.streetcar.backend.config;

import com.streetcar.backend.service.JwtVerifier;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import java.io.IOException;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, JwtVerifier verifier) throws Exception {
        return http
                // Tokens travel in a header, not a cookie, so there is no session for CSRF to ride on.
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(requests -> requests
                        // Lets Spring's own error page render instead of turning a 404 into a 401.
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/submissions/**").hasRole("ADVISOR")
                        .anyRequest().authenticated())
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, denied) -> reject(response,
                                HttpStatus.UNAUTHORIZED, "Please sign in to continue."))
                        .accessDeniedHandler((request, response, denied) -> reject(response,
                                HttpStatus.FORBIDDEN, "You do not have permission to do that.")))
                .addFilterBefore(new JwtAuthenticationFilter(verifier), UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /** Accounts come from JWTs, so this only stops Spring generating a default user and password. */
    @Bean
    UserDetailsService noPasswordLogin() {
        return new InMemoryUserDetailsManager();
    }

    // The same {"message": ...} shape as the controllers, which the frontend already displays.
    private static void reject(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"message\":\"" + message + "\"}");
    }
}
