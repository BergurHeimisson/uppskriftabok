package is.bergur.auth.controller;

import is.bergur.auth.AbstractIntegrationTest;
import is.bergur.auth.model.User;
import is.bergur.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class AdminControllerTest extends AbstractIntegrationTest {

    @Autowired TestRestTemplate rest;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @BeforeEach
    void clean() {
        userRepository.deleteAll();
    }

    @Test
    void listUsersRequiresAdminRole() {
        createUser("member", "pass", "MEMBER");
        String token = loginToken("member", "pass");

        var headers = new HttpHeaders();
        headers.setBearerAuth(token);
        var response = rest.exchange("/admin/users", HttpMethod.GET, new HttpEntity<>(headers), Void.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void listUsersRequiresAuthentication() {
        var response = rest.getForEntity("/admin/users", Void.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void adminCanListUsers() {
        createUser("bergur", "secret", "ADMIN");
        createUser("sigga", "pass2", "MEMBER");
        String token = loginToken("bergur", "secret");

        var headers = new HttpHeaders();
        headers.setBearerAuth(token);
        var response = rest.exchange("/admin/users", HttpMethod.GET, new HttpEntity<>(headers), Map[].class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }

    @Test
    void adminCanCreateUser() {
        createUser("bergur", "secret", "ADMIN");
        String token = loginToken("bergur", "secret");

        var headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        var body = Map.of("username", "newmember", "password", "newpass123", "role", "MEMBER");
        var response = rest.exchange("/admin/users", HttpMethod.POST,
                new HttpEntity<>(body, headers), Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).containsKey("id");
        assertThat(userRepository.findByUsername("newmember")).isPresent();
    }

    @Test
    void adminCanDeleteUser() {
        createUser("bergur", "secret", "ADMIN");
        var victim = createUser("victim", "pass", "MEMBER");
        String token = loginToken("bergur", "secret");

        var headers = new HttpHeaders();
        headers.setBearerAuth(token);
        var response = rest.exchange("/admin/users/" + victim.getId(),
                HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(userRepository.findById(victim.getId())).isEmpty();
    }

    @Test
    void adminCanResetUserPassword() {
        createUser("bergur", "secret", "ADMIN");
        var target = createUser("sigga", "oldpass", "MEMBER");
        String token = loginToken("bergur", "secret");

        var headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        var body = Map.of("password", "newpass456");
        var response = rest.exchange("/admin/users/" + target.getId() + "/password",
                HttpMethod.PUT, new HttpEntity<>(body, headers), Void.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        // Verify new password works
        var loginResponse = rest.postForEntity("/auth/login",
                Map.of("username", "sigga", "password", "newpass456"), Map.class);
        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void deleteNonExistentUserReturns404() {
        createUser("bergur", "secret", "ADMIN");
        String token = loginToken("bergur", "secret");

        var headers = new HttpHeaders();
        headers.setBearerAuth(token);
        var response = rest.exchange("/admin/users/00000000-0000-0000-0000-000000000000",
                HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    private User createUser(String username, String password, String role) {
        var user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        return userRepository.save(user);
    }

    private String loginToken(String username, String password) {
        var response = rest.postForEntity("/auth/login",
                Map.of("username", username, "password", password), Map.class);
        return (String) response.getBody().get("accessToken");
    }
}
