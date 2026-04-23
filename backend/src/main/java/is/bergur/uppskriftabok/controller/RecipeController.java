package is.bergur.uppskriftabok.controller;

import is.bergur.uppskriftabok.model.Recipe;
import is.bergur.uppskriftabok.service.RecipeService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService service;

    public RecipeController(RecipeService service) {
        this.service = service;
    }

    @GetMapping
    public List<Recipe> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Recipe get(@PathVariable UUID id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Recipe create(@RequestBody Recipe recipe) {
        return service.create(recipe);
    }

    @PutMapping("/{id}")
    public Recipe update(@PathVariable UUID id, @RequestBody Recipe recipe) {
        return service.update(id, recipe);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
