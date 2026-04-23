package is.bergur.uppskriftabok.controller;

import is.bergur.uppskriftabok.model.GroceryItem;
import is.bergur.uppskriftabok.service.GroceryService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/grocery")
public class GroceryController {

    private final GroceryService service;

    public GroceryController(GroceryService service) {
        this.service = service;
    }

    @GetMapping
    public List<GroceryItem> list() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public List<GroceryItem> add(@RequestBody List<GroceryItem> items) {
        return service.addItems(items);
    }

    @PatchMapping("/{id}")
    public GroceryItem toggle(@PathVariable UUID id) {
        return service.toggle(id);
    }

    @DeleteMapping("/completed")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearCompleted() {
        service.clearCompleted();
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearAll() {
        service.clearAll();
    }
}
