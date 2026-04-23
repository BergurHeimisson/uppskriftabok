package is.bergur.uppskriftabok.service;

import is.bergur.uppskriftabok.AbstractIntegrationTest;
import is.bergur.uppskriftabok.model.Recipe;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

class ImportServiceTest extends AbstractIntegrationTest {

    @Autowired ImportService importService;
    @MockBean  PageFetcher pageFetcher;

    @Test
    void extractsTitleIngredientsAndStepsFromJsonLd() throws IOException {
        when(pageFetcher.fetch("https://example.com/recipe")).thenReturn(jsonLdPage("""
                {
                  "@type": "Recipe",
                  "name": "Pasta Bolognese",
                  "description": "Classic Italian pasta",
                  "recipeYield": "4",
                  "recipeIngredient": ["500g ground beef", "200g pasta"],
                  "recipeInstructions": [
                    {"@type": "HowToStep", "text": "Cook the beef."},
                    {"@type": "HowToStep", "text": "Boil pasta."}
                  ]
                }
                """));

        Recipe recipe = importService.importFromUrl("https://example.com/recipe");

        assertThat(recipe.getTitle()).isEqualTo("Pasta Bolognese");
        assertThat(recipe.getDescription()).isEqualTo("Classic Italian pasta");
        assertThat(recipe.getServings()).isEqualTo(4);
        assertThat(recipe.getIngredients()).hasSize(2);
        assertThat(recipe.getIngredients().getFirst().unit()).isEqualTo("g");
        assertThat(recipe.getSteps()).hasSize(2);
        assertThat(recipe.getSource()).isEqualTo("https://example.com/recipe");
    }

    @Test
    void fallsBackToOpenGraphWhenNoJsonLd() throws IOException {
        when(pageFetcher.fetch("https://example.com/og")).thenReturn(Jsoup.parse("""
                <html>
                  <head>
                    <meta property="og:title" content="Soup Recipe"/>
                    <meta property="og:description" content="A warm soup."/>
                  </head>
                </html>
                """));

        Recipe recipe = importService.importFromUrl("https://example.com/og");

        assertThat(recipe.getTitle()).isEqualTo("Soup Recipe");
        assertThat(recipe.getDescription()).isEqualTo("A warm soup.");
        assertThat(recipe.getIngredients()).isNullOrEmpty();
    }

    @Test
    void throws422WhenNoRecipeDataFound() throws IOException {
        when(pageFetcher.fetch("https://example.com/norecipe")).thenReturn(Jsoup.parse("""
                <html><head><title>Not a recipe</title></head></html>
                """));

        assertThatThrownBy(() -> importService.importFromUrl("https://example.com/norecipe"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("422");
    }

    private Document jsonLdPage(String json) {
        return Jsoup.parse("<html><head><script type=\"application/ld+json\">" + json + "</script></head></html>");
    }
}
