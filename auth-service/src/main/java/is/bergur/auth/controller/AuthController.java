package is.bergur.auth.controller;

import is.bergur.auth.dto.LoginRequest;
import is.bergur.auth.dto.LoginResponse;
import is.bergur.auth.repository.UserRepository;
import is.bergur.auth.service.JwtService;
import is.bergur.auth.service.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final long expirySeconds;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            @Value("${jwt.expiry-seconds}") long expirySeconds) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.expirySeconds = expirySeconds;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        var user = userRepository.findByUsername(request.username())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String accessToken = jwtService.generateToken(user);
        String rawRefresh = refreshTokenService.createRefreshToken(user);

        Cookie cookie = new Cookie("refresh_token", rawRefresh);
        cookie.setHttpOnly(true);
        cookie.setPath("/auth");
        cookie.setMaxAge((int) (refreshTokenService.getRefreshExpiryDays() * 86400));
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);

        return ResponseEntity.ok(new LoginResponse(accessToken, expirySeconds));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request) {
        String rawToken = extractRefreshCookie(request);
        if (rawToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return refreshTokenService.consumeRefreshToken(rawToken)
                .map(user -> {
                    String newAccess = jwtService.generateToken(user);
                    return ResponseEntity.ok(new LoginResponse(newAccess, expirySeconds));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest request) {
        // Delete by user ID from JWT (reliable even when cookie path doesn't match)
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtService.isValid(token)) {
                var claims = jwtService.validateAndParse(token);
                UUID userId = UUID.fromString(claims.getSubject());
                userRepository.findById(userId).ifPresent(refreshTokenService::deleteForUser);
            }
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/validate")
    public ResponseEntity<Void> validate(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Original-Method", required = false) String originalMethod) {
        if ("GET".equals(originalMethod) || "HEAD".equals(originalMethod) || "OPTIONS".equals(originalMethod)) {
            return ResponseEntity.ok().build();
        }
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        if (!jwtService.isValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok().build();
    }

    private String extractRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> "refresh_token".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
