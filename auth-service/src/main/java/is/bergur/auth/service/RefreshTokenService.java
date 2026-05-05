package is.bergur.auth.service;

import is.bergur.auth.model.RefreshToken;
import is.bergur.auth.model.User;
import is.bergur.auth.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repository;
    private final long refreshExpiryDays;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(
            RefreshTokenRepository repository,
            @Value("${jwt.refresh-expiry-days}") long refreshExpiryDays) {
        this.repository = repository;
        this.refreshExpiryDays = refreshExpiryDays;
    }

    @Transactional
    public String createRefreshToken(User user) {
        repository.deleteByUser(user);

        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        var token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(sha256(rawToken));
        token.setExpiresAt(Instant.now().plus(refreshExpiryDays, ChronoUnit.DAYS));
        repository.save(token);

        return rawToken;
    }

    @Transactional
    public Optional<User> consumeRefreshToken(String rawToken) {
        return repository.findByTokenHash(sha256(rawToken))
                .filter(t -> t.getExpiresAt().isAfter(Instant.now()))
                .map(t -> {
                    User user = t.getUser();
                    repository.delete(t);
                    return user;
                });
    }

    @Transactional
    public void deleteForUser(User user) {
        repository.deleteByUser(user);
    }

    public long getRefreshExpiryDays() { return refreshExpiryDays; }

    private String sha256(String input) {
        try {
            var digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(input.getBytes()));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
