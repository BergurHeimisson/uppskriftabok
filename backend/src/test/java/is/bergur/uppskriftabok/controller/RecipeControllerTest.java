package is.bergur.uppskriftabok.controller;

import is.bergur.uppskriftabok.AbstractIntegrationTest;
import is.bergur.uppskriftabok.model.Ingredient;
import is.bergur.uppskriftabok.model.Recipe;
import is.bergur.uppskriftabok.repository.RecipeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class RecipeControllerTest extends AbstractIntegrationTest {

    @Autowired TestRestTemplate rest;
    @Autowired RecipeRepository repository;

    @BeforeEach
    void clean() { repository.deleteAll(); }

    @Test
    void createRecipeReturns201WithId() {
        var response = rest.postForEntity("/api/recipes", sampleRecipe("Kjötbollar"), Recipe.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getId()).isNotNull();
    }

    @Test
    void fetchRecipeByIdReturnsFullData() {
        var created = rest.postForEntity("/api/recipes", sampleRecipe("Hummus"), Recipe.class).getBody();

        var response = rest.getForEntity("/api/recipes/" + created.getId(), Recipe.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getTitle()).isEqualTo("Hummus");
        assertThat(response.getBody().getIngredients()).hasSize(1);
    }

    @Test
    void fetchNonExistentRecipeReturns404() {
        var response = rest.getForEntity("/api/recipes/" + UUID.randomUUID(), Recipe.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void listRecipesReturnsAll() {
        rest.postForEntity("/api/recipes", sampleRecipe("A"), Recipe.class);
        rest.postForEntity("/api/recipes", sampleRecipe("B"), Recipe.class);

        var response = rest.getForEntity("/api/recipes", Recipe[].class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }

    @Test
    void updateRecipeReturnsUpdatedData() {
        var created = rest.postForEntity("/api/recipes", sampleRecipe("Old Title"), Recipe.class).getBody();
        created.setTitle("New Title");

        var response = rest.exchange(
                "/api/recipes/" + created.getId(), HttpMethod.PUT,
                new HttpEntity<>(created), Recipe.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getTitle()).isEqualTo("New Title");
    }

    @Test
    void deleteRecipeReturns204AndIsGone() {
        var created = rest.postForEntity("/api/recipes", sampleRecipe("Delete me"), Recipe.class).getBody();

        rest.delete("/api/recipes/" + created.getId());
        var response = rest.getForEntity("/api/recipes/" + created.getId(), Recipe.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void parseIngredientsReturnsStructuredList() {
        var body = Map.of("lines", List.of("500g ground beef", "1 egg", "1/2 dl breadcrumbs"));
        var response = rest.postForEntity("/api/parse-ingredients", body, Ingredient[].class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(3);
        assertThat(response.getBody()[0].unit()).isEqualTo("g");
        assertThat(response.getBody()[1].item()).isEqualTo("egg");
    }

    private Recipe sampleRecipe(String title) {
        var r = new Recipe();
        r.setTitle(title);
        r.setServings(4);
        r.setTags(new String[]{"dinner"});
        r.setIngredients(List.of(new Ingredient(500.0, "g", "ground beef")));
        r.setInstructions("Mix ingredients.\nCook.");
        return r;
    }
}
