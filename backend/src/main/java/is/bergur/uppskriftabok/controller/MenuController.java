package is.bergur.uppskriftabok.controller;

import is.bergur.uppskriftabok.model.GroceryItem;
import is.bergur.uppskriftabok.model.Menu;
import is.bergur.uppskriftabok.service.MenuService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/menus")
public class MenuController {

    private final MenuService service;

    public MenuController(MenuService service) {
        this.service = service;
    }

    @GetMapping
    public List<Menu> list() {
        return service.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Menu create(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        int guestCount = body.containsKey("guestCount") ? ((Number) body.get("guestCount")).intValue() : 4;
        List<String> rawIds = (List<String>) body.get("recipeIds");
        List<UUID> recipeIds = rawIds == null ? List.of() : rawIds.stream().map(UUID::fromString).toList();
        return service.create(name, guestCount, recipeIds);
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable UUID id) {
        var detail = service.get(id);
        return Map.of(
                "id", detail.menu().getId(),
                "name", detail.menu().getName(),
                "dateCreated", detail.menu().getDateCreated(),
                "guestCount", detail.menu().getGuestCount(),
                "recipeIds", detail.menu().getRecipeIds(),
                "recipes", detail.recipes()
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @PostMapping("/{id}/grocery")
    @ResponseStatus(HttpStatus.CREATED)
    public List<GroceryItem> addToGrocery(@PathVariable UUID id) {
        return service.addToGrocery(id);
    }
}
