package is.bergur.uppskriftabok.controller;

import is.bergur.uppskriftabok.AbstractIntegrationTest;
import is.bergur.uppskriftabok.model.GroceryItem;
import is.bergur.uppskriftabok.repository.GroceryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class GroceryControllerTest extends AbstractIntegrationTest {

    @Autowired TestRestTemplate rest;
    @Autowired GroceryRepository repository;

    @BeforeEach
    void clean() { repository.deleteAll(); }

    @Test
    void emptyGroceryListReturnsEmptyArray() {
        var response = rest.getForEntity("/api/grocery", GroceryItem[].class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEmpty();
    }

    @Test
    void addItemsReturns201WithCreatedItems() {
        var body = List.of(
                Map.of("label", "500g ground beef"),
                Map.of("label", "1 egg")
        );
        var response = rest.postForEntity("/api/grocery", body, GroceryItem[].class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody()[0].getId()).isNotNull();
    }

    @Test
    void listGroceryItemsReturnsAllAdded() {
        var body = List.of(Map.of("label", "Milk"));
        rest.postForEntity("/api/grocery", body, GroceryItem[].class);

        var response = rest.getForEntity("/api/grocery", GroceryItem[].class);
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody()[0].getLabel()).isEqualTo("Milk");
    }

    @Test
    void toggleCheckedFlipsState() {
        var item = addItem("Eggs");
        assertThat(item.isChecked()).isFalse();

        var patched = rest.patchForObject("/api/grocery/" + item.getId(), null, GroceryItem.class);
        assertThat(patched.isChecked()).isTrue();

        var patchedAgain = rest.patchForObject("/api/grocery/" + item.getId(), null, GroceryItem.class);
        assertThat(patchedAgain.isChecked()).isFalse();
    }

    @Test
    void clearCompletedRemovesOnlyCheckedItems() {
        var item = addItem("Butter");
        rest.patchForObject("/api/grocery/" + item.getId(), null, GroceryItem.class);
        addItem("Milk");

        rest.delete("/api/grocery/completed");

        var response = rest.getForEntity("/api/grocery", GroceryItem[].class);
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody()[0].getLabel()).isEqualTo("Milk");
    }

    @Test
    void clearAllRemovesEverything() {
        addItem("A");
        addItem("B");

        rest.delete("/api/grocery");

        var response = rest.getForEntity("/api/grocery", GroceryItem[].class);
        assertThat(response.getBody()).isEmpty();
    }

    private GroceryItem addItem(String label) {
        var body = List.of(Map.of("label", label));
        return rest.postForEntity("/api/grocery", body, GroceryItem[].class).getBody()[0];
    }
}
