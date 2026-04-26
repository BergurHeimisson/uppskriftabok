package is.bergur.uppskriftabok.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import is.bergur.uppskriftabok.model.Recipe;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class ImportService {

    private final PageFetcher pageFetcher;
    private final IngredientParser ingredientParser;
    private final ObjectMapper objectMapper;

    public ImportService(PageFetcher pageFetcher, IngredientParser ingredientParser, ObjectMapper objectMapper) {
        this.pageFetcher = pageFetcher;
        this.ingredientParser = ingredientParser;
        this.objectMapper = objectMapper;
    }

    public Recipe importFromUrl(String url) {
        Document doc;
        try {
            doc = pageFetcher.fetch(url);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Could not fetch URL: " + e.getMessage());
        }

        Recipe recipe = tryJsonLd(doc);
        if (recipe == null) recipe = tryOpenGraph(doc);
        if (recipe == null) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "No recipe data found at URL");
        }

        recipe.setSource(url);
        return recipe;
    }

    private Recipe tryJsonLd(Document doc) {
        for (Element script : doc.select("script[type=application/ld+json]")) {
            try {
                JsonNode root = objectMapper.readTree(script.data());
                JsonNode node = findRecipeNode(root);
                if (node != null) return parseJsonLd(node);
            } catch (Exception ignored) {}
        }
        return null;
    }

    private JsonNode findRecipeNode(JsonNode root) {
        if (root.isArray()) {
            for (JsonNode child : root) {
                JsonNode found = findRecipeNode(child);
                if (found != null) return found;
            }
            return null;
        }
        String type = root.path("@type").asText("");
        if ("Recipe".equals(type)) return root;
        JsonNode graph = root.path("@graph");
        if (!graph.isMissingNode()) return findRecipeNode(graph);
        return null;
    }

    private Recipe parseJsonLd(JsonNode node) {
        Recipe recipe = new Recipe();
        recipe.setTitle(node.path("name").asText(null));
        recipe.setDescription(node.path("description").asText(null));

        String yield = node.path("recipeYield").asText(null);
        if (yield != null) {
            try { recipe.setServings(Integer.parseInt(yield.trim().split("[^0-9]")[0])); }
            catch (NumberFormatException ignored) {}
        }

        List<String> rawIngredients = new ArrayList<>();
        for (JsonNode ing : node.path("recipeIngredient")) rawIngredients.add(ing.asText());
        if (!rawIngredients.isEmpty()) recipe.setIngredients(IngredientParser.parse(rawIngredients));

        List<String> steps = new ArrayList<>();
        JsonNode recipeInstructions = node.path("recipeInstructions");
        if (recipeInstructions.isArray()) {
            for (JsonNode step : recipeInstructions) {
                String text = step.isTextual() ? step.asText() : step.path("text").asText(null);
                if (text != null && !text.isBlank()) steps.add(text.trim());
            }
        }
        if (!steps.isEmpty()) recipe.setInstructions(String.join("\n", steps));

        return recipe.getTitle() != null ? recipe : null;
    }

    private Recipe tryOpenGraph(Document doc) {
        String title = doc.select("meta[property=og:title]").attr("content");
        String description = doc.select("meta[property=og:description]").attr("content");
        if (title.isBlank() && description.isBlank()) return null;
        Recipe recipe = new Recipe();
        if (!title.isBlank()) recipe.setTitle(title);
        if (!description.isBlank()) recipe.setDescription(description);
        return recipe;
    }
}
