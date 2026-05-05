package is.bergur.auth.dto;

import is.bergur.auth.model.User;
import java.time.Instant;
import java.util.UUID;

public record UserResponse(UUID id, String username, String role, Instant createdAt) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getRole(), user.getCreatedAt());
    }
}
