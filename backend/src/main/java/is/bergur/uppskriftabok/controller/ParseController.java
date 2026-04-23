package is.bergur.uppskriftabok.controller;

import is.bergur.uppskriftabok.model.Ingredient;
import is.bergur.uppskriftabok.service.IngredientParser;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parse-ingredients")
public class ParseController {

    @PostMapping
    public List<Ingredient> parse(@RequestBody Map<String, List<String>> body) {
        return IngredientParser.parse(body.getOrDefault("lines", List.of()));
    }
}
