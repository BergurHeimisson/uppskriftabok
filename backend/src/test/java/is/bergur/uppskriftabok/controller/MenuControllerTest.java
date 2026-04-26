package is.bergur.uppskriftabok.controller;

import is.bergur.uppskriftabok.AbstractIntegrationTest;
import is.bergur.uppskriftabok.model.GroceryItem;
import is.bergur.uppskriftabok.model.Ingredient;
import is.bergur.uppskriftabok.model.Menu;
import is.bergur.uppskriftabok.model.Recipe;
import is.bergur.uppskriftabok.repository.GroceryRepository;
import is.bergur.uppskriftabok.repository.MenuRepository;
import is.bergur.uppskriftabok.repository.RecipeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class MenuControllerTest extends AbstractIntegrationTest {

    @Autowired TestRestTemplate rest;
    @Autowired MenuRepository menuRepository;
    @Autowired RecipeRepository recipeRepository;
    @Autowired GroceryRepository groceryRepository;

    @BeforeEach
    void clean() {
        menuRepository.deleteAll();
        groceryRepository.deleteAll();
        recipeRepository.deleteAll();
    }

    @Test
    void createMenuReturns201WithId() {
        var recipe = recipeRepository.save(sampleRecipe("Kjötbollar", 4));

        var body = Map.of("name", "Jólakveðjur", "guestCount", 8, "recipeIds", List.of(recipe.getId().toString()));
        var response = rest.postForEntity("/api/menus", body, Menu.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getId()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo("Jólakveðjur");
        assertThat(response.getBody().getGuestCount()).isEqualTo(8);
    }

    @Test
    void listMenusReturnsAll() {
        var recipe = recipeRepository.save(sampleRecipe("Hummus", 4));
        var ids = List.of(recipe.getId());

        rest.postForEntity("/api/menus", Map.of("name", "Kvöldmatur A", "guestCount", 4, "recipeIds", List.of(recipe.getId().toString())), Menu.class);
        rest.postForEntity("/api/menus", Map.of("name", "Kvöldmatur B", "guestCount", 6, "recipeIds", List.of(recipe.getId().toString())), Menu.class);

        var response = rest.getForEntity("/api/menus", Menu[].class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }

    @Test
    void getMenuReturnsMenuWithRecipes() {
        var recipe = recipeRepository.save(sampleRecipe("Lax", 4));
        var created = rest.postForEntity("/api/menus",
                Map.of("name", "Fiskimatur", "guestCount", 4, "recipeIds", List.of(recipe.getId().toString())),
                Menu.class).getBody();

        var response = rest.getForEntity("/api/menus/" + created.getId(), Map.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().get("name")).isEqualTo("Fiskimatur");
        assertThat((List<?>) response.getBody().get("recipes")).hasSize(1);
    }

    @Test
    void getNonExistentMenuReturns404() {
        var response = rest.getForEntity("/api/menus/" + UUID.randomUUID(), Map.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void deleteMenuReturns204AndIsGone() {
        var recipe = recipeRepository.save(sampleRecipe("Pizza", 4));
        var created = rest.postForEntity("/api/menus",
                Map.of("name", "Ítalskur kvöldmatur", "guestCount", 4, "recipeIds", List.of(recipe.getId().toString())),
                Menu.class).getBody();

        rest.delete("/api/menus/" + created.getId());

        var response = rest.getForEntity("/api/menus/" + created.getId(), Map.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void addMenuToGroceryCreatesScaledItems() {
        // Recipe: 4 servings, 500g beef. Menu: 8 guests → expect 1000g
        var recipe = recipeRepository.save(sampleRecipe("Kjötbollar", 4));
        var created = rest.postForEntity("/api/menus",
                Map.of("name", "Stór veisla", "guestCount", 8, "recipeIds", List.of(recipe.getId().toString())),
                Menu.class).getBody();

        var response = rest.postForEntity("/api/menus/" + created.getId() + "/grocery", null, GroceryItem[].class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotEmpty();

        var labels = List.of(response.getBody()).stream().map(GroceryItem::getLabel).toList();
        assertThat(labels).anyMatch(l -> l.contains("1000") || l.contains("1,000"));
    }

    private Recipe sampleRecipe(String title, int servings) {
        var r = new Recipe();
        r.setTitle(title);
        r.setServings(servings);
        r.setTags(new String[]{"dinner"});
        r.setIngredients(List.of(new Ingredient(500.0, "g", "nautakjöt")));
        r.setInstructions("Elda vel.");
        return r;
    }
}
