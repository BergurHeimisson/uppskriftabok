package is.bergur.uppskriftabok.controller;

import is.bergur.uppskriftabok.model.Recipe;
import is.bergur.uppskriftabok.service.ImportService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/import")
public class ImportController {

    private final ImportService service;

    public ImportController(ImportService service) {
        this.service = service;
    }

    @PostMapping
    public Recipe importFromUrl(@RequestParam String url) {
        return service.importFromUrl(url);
    }
}
