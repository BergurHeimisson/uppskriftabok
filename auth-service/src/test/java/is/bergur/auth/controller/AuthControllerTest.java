package is.bergur.auth.controller;

import is.bergur.auth.AbstractIntegrationTest;
import is.bergur.auth.repository.UserRepository;
import is.bergur.auth.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class AuthControllerTest extends AbstractIntegrationTest {

    @Autowired TestRestTemplate rest;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @BeforeEach
    void clean() {
        userRepository.deleteAll();
    }

    @Test
    void loginWithValidCredentialsReturnsAccessToken() {
        createUser("bergur", "secret123", "ADMIN");

        var body = Map.of("username", "bergur", "password", "secret123");
        var response = rest.postForEntity("/auth/login", body, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsKey("accessToken");
        assertThat(response.getBody().get("accessToken")).isNotNull();
    }

    @Test
    void loginWithWrongPasswordReturns401() {
        createUser("bergur", "secret123", "ADMIN");

        var body = Map.of("username", "bergur", "password", "wrongpassword");
        var response = rest.postForEntity("/auth/login", body, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void loginWithUnknownUserReturns401() {
        var body = Map.of("username", "nobody", "password", "anything");
        var response = rest.postForEntity("/auth/login", body, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void loginSetsHttpOnlyRefreshTokenCookie() {
        createUser("bergur", "secret123", "ADMIN");

        var body = Map.of("username", "bergur", "password", "secret123");
        var response = rest.postForEntity("/auth/login", body, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        var setCookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertThat(setCookie).contains("refresh_token=");
        assertThat(setCookie).containsIgnoringCase("HttpOnly");
        assertThat(setCookie).containsIgnoringCase("SameSite=Strict");
    }

    @Test
    void validateEndpointReturns200ForValidToken() {
        createUser("bergur", "secret123", "ADMIN");

        var loginBody = Map.of("username", "bergur", "password", "secret123");
        var loginResponse = rest.postForEntity("/auth/login", loginBody, Map.class);
        var token = (String) loginResponse.getBody().get("accessToken");

        var headers = new HttpHeaders();
        headers.setBearerAuth(token);
        var response = rest.exchange("/auth/validate", HttpMethod.GET, new HttpEntity<>(headers), Void.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void validateEndpointReturns401WithNoToken() {
        var response = rest.getForEntity("/auth/validate", Void.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void validateEndpointReturns401WithGarbageToken() {
        var headers = new HttpHeaders();
        headers.setBearerAuth("not.a.real.token");
        var response = rest.exchange("/auth/validate", HttpMethod.GET, new HttpEntity<>(headers), Void.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void validatePassesReadMethodsWithoutToken() {
        var headers = new HttpHeaders();
        headers.set("X-Original-Method", "GET");
        var response = rest.exchange("/auth/validate", HttpMethod.GET, new HttpEntity<>(headers), Void.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void validateBlocksWriteMethodsWithoutToken() {
        var headers = new HttpHeaders();
        headers.set("X-Original-Method", "POST");
        var response = rest.exchange("/auth/validate", HttpMethod.GET, new HttpEntity<>(headers), Void.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void validatePassesWriteMethodsWithValidToken() {
        createUser("bergur", "secret123", "ADMIN");
        var loginBody = Map.of("username", "bergur", "password", "secret123");
        var loginResponse = rest.postForEntity("/auth/login", loginBody, Map.class);
        var token = (String) loginResponse.getBody().get("accessToken");

        var headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.set("X-Original-Method", "POST");
        var response = rest.exchange("/auth/validate", HttpMethod.GET, new HttpEntity<>(headers), Void.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void logoutInvalidatesRefreshToken() {
        createUser("bergur", "secret123", "ADMIN");

        var loginBody = Map.of("username", "bergur", "password", "secret123");
        var loginResponse = rest.postForEntity("/auth/login", loginBody, Map.class);
        var token = (String) loginResponse.getBody().get("accessToken");
        var cookie = loginResponse.getHeaders().getFirst(HttpHeaders.SET_COOKIE);

        var logoutHeaders = new HttpHeaders();
        logoutHeaders.setBearerAuth(token);
        rest.exchange("/auth/logout", HttpMethod.POST, new HttpEntity<>(logoutHeaders), Void.class);

        // After logout, refresh with same cookie should fail
        var refreshHeaders = new HttpHeaders();
        refreshHeaders.set(HttpHeaders.COOKIE, cookie);
        var refreshResponse = rest.exchange("/auth/refresh", HttpMethod.POST,
                new HttpEntity<>(refreshHeaders), Map.class);

        assertThat(refreshResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void refreshReturnsNewAccessToken() {
        createUser("bergur", "secret123", "ADMIN");

        var loginBody = Map.of("username", "bergur", "password", "secret123");
        var loginResponse = rest.postForEntity("/auth/login", loginBody, Map.class);
        var cookie = loginResponse.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        var cookieValue = cookie.split(";")[0]; // just "refresh_token=<value>"

        var headers = new HttpHeaders();
        headers.set(HttpHeaders.COOKIE, cookieValue);
        var response = rest.exchange("/auth/refresh", HttpMethod.POST, new HttpEntity<>(headers), Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsKey("accessToken");
    }

    private void createUser(String username, String password, String role) {
        var user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        userRepository.save(user);
    }
}
