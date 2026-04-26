package is.bergur.uppskriftabok.service;

import is.bergur.uppskriftabok.model.GroceryItem;
import is.bergur.uppskriftabok.model.Ingredient;
import is.bergur.uppskriftabok.model.Menu;
import is.bergur.uppskriftabok.model.Recipe;
import is.bergur.uppskriftabok.repository.MenuRepository;
import is.bergur.uppskriftabok.repository.RecipeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class MenuService {

    public record MenuDetail(Menu menu, List<Recipe> recipes) {}

    private final MenuRepository menuRepository;
    private final RecipeRepository recipeRepository;
    private final GroceryService groceryService;

    public MenuService(MenuRepository menuRepository, RecipeRepository recipeRepository, GroceryService groceryService) {
        this.menuRepository = menuRepository;
        this.recipeRepository = recipeRepository;
        this.groceryService = groceryService;
    }

    public List<Menu> list() {
        return menuRepository.findAll();
    }

    public Menu create(String name, int guestCount, List<UUID> recipeIds) {
        var menu = new Menu();
        menu.setName(name);
        menu.setGuestCount(guestCount);
        menu.setRecipeIds(recipeIds);
        return menuRepository.save(menu);
    }

    public MenuDetail get(UUID id) {
        var menu = menuRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        var recipes = recipeRepository.findAllById(menu.getRecipeIds());
        return new MenuDetail(menu, (List<Recipe>) recipes);
    }

    public void delete(UUID id) {
        if (!menuRepository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        menuRepository.deleteById(id);
    }

    public List<GroceryItem> addToGrocery(UUID menuId) {
        var menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        var recipes = recipeRepository.findAllById(menu.getRecipeIds());

        List<GroceryItem> items = new ArrayList<>();
        for (Recipe recipe : recipes) {
            if (recipe.getIngredients() == null) continue;
            int base = recipe.getServings() != null && recipe.getServings() > 0 ? recipe.getServings() : 1;
            double scale = (double) menu.getGuestCount() / base;

            for (Ingredient ing : recipe.getIngredients()) {
                var item = new GroceryItem();
                item.setRecipeId(recipe.getId());
                item.setLabel(formatLabel(ing, scale));
                items.add(item);
            }
        }
        return groceryService.addItems(items);
    }

    private String formatLabel(Ingredient ing, double scale) {
        if (ing.amount() == null) {
            return ing.unit().isBlank() ? ing.item() : ing.unit() + " " + ing.item();
        }
        double scaled = ing.amount() * scale;
        String amountStr = formatAmount(scaled);
        return ing.unit().isBlank()
                ? amountStr + " " + ing.item()
                : amountStr + " " + ing.unit() + " " + ing.item();
    }

    private String formatAmount(double amount) {
        if (amount > 10) {
            long rounded = Math.round(amount);
            return String.valueOf(rounded);
        }
        // Common fractions
        double[] targets = {0.125, 0.25, 0.333, 0.5, 0.667, 0.75};
        String[] labels = {"1/8", "1/4", "1/3", "1/2", "2/3", "3/4"};
        double whole = Math.floor(amount);
        double frac = amount - whole;
        int closest = 0;
        for (int i = 1; i < targets.length; i++) {
            if (Math.abs(targets[i] - frac) < Math.abs(targets[closest] - frac)) closest = i;
        }
        if (Math.abs(targets[closest] - frac) < 0.07) {
            String fracStr = frac < 0.01 ? "" : labels[closest];
            if (whole < 1) return fracStr.isEmpty() ? "0" : fracStr;
            return fracStr.isEmpty() ? String.valueOf((long) whole) : (long) whole + " " + fracStr;
        }
        if (amount == Math.floor(amount)) return String.valueOf((long) amount);
        return String.format("%.1f", amount);
    }
}
