package is.bergur.auth.dto;

public record LoginResponse(String accessToken, long expiresIn) {}
