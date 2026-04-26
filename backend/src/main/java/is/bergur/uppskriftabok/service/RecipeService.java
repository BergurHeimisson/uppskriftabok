package is.bergur.uppskriftabok.service;

import is.bergur.uppskriftabok.model.Recipe;
import is.bergur.uppskriftabok.repository.RecipeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class RecipeService {

    private final RecipeRepository repository;

    public RecipeService(RecipeRepository repository) {
        this.repository = repository;
    }

    public List<Recipe> findAll() {
        return repository.findAll();
    }

    public Recipe findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public Recipe create(Recipe recipe) {
        recipe.setId(null);
        return repository.save(recipe);
    }

    public Recipe update(UUID id, Recipe updated) {
        Recipe existing = findById(id);
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setServings(updated.getServings());
        existing.setPrepTime(updated.getPrepTime());
        existing.setCookTime(updated.getCookTime());
        existing.setTags(updated.getTags());
        existing.setIngredients(updated.getIngredients());
        existing.setInstructions(updated.getInstructions());
        existing.setSource(updated.getSource());
        existing.setPrepAheadNote(updated.getPrepAheadNote());
        return repository.save(existing);
    }

    public void delete(UUID id) {
        if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        repository.deleteById(id);
    }
}
