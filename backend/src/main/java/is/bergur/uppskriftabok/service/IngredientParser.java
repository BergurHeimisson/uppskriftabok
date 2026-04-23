package is.bergur.uppskriftabok.service;

import is.bergur.uppskriftabok.model.Ingredient;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class IngredientParser {

    private static final Map<String, String> UNIT_ALIASES = Map.ofEntries(
            Map.entry("g", "g"),
            Map.entry("gr", "g"),
            Map.entry("gram", "g"),
            Map.entry("grams", "g"),
            Map.entry("kg", "kg"),
            Map.entry("kilo", "kg"),
            Map.entry("kilos", "kg"),
            Map.entry("dl", "dl"),
            Map.entry("deciliter", "dl"),
            Map.entry("deciliters", "dl"),
            Map.entry("l", "l"),
            Map.entry("liter", "l"),
            Map.entry("litre", "l"),
            Map.entry("liters", "l"),
            Map.entry("litres", "l"),
            Map.entry("ml", "ml"),
            Map.entry("milliliter", "ml"),
            Map.entry("milliliters", "ml"),
            Map.entry("tsp", "tsp"),
            Map.entry("ts", "tsp"),
            Map.entry("teaspoon", "tsp"),
            Map.entry("teaspoons", "tsp"),
            Map.entry("tbsp", "tbsp"),
            Map.entry("tbs", "tbsp"),
            Map.entry("tablespoon", "tbsp"),
            Map.entry("tablespoons", "tbsp"),
            Map.entry("cup", "cup"),
            Map.entry("cups", "cup")
    );

    // Matches: optional-amount optional-unit rest
    // Amount may be concatenated with unit (500g) or space-separated (500 g)
    private static final Pattern AMOUNT_UNIT_ITEM = Pattern.compile(
            "^(\\d+(?:[.,]\\d+)?(?:/\\d+)?)\\s*([a-zA-Z]+)\\s+(.+)$"
    );
    private static final Pattern AMOUNT_ITEM = Pattern.compile(
            "^(\\d+(?:[.,]\\d+)?(?:/\\d+)?)\\s+(.+)$"
    );

    public static List<Ingredient> parse(List<String> lines) {
        return lines.stream()
                .filter(l -> !l.isBlank())
                .map(IngredientParser::parseLine)
                .toList();
    }

    private static Ingredient parseLine(String raw) {
        String line = normaliseUnicode(raw.trim());

        Matcher m1 = AMOUNT_UNIT_ITEM.matcher(line);
        if (m1.matches()) {
            String canonical = UNIT_ALIASES.get(m1.group(2).toLowerCase());
            if (canonical != null) {
                return new Ingredient(parseAmount(m1.group(1)), canonical, m1.group(3).trim());
            }
        }

        Matcher m2 = AMOUNT_ITEM.matcher(line);
        if (m2.matches()) {
            return new Ingredient(parseAmount(m2.group(1)), "", m2.group(2).trim());
        }

        return new Ingredient(null, "", line);
    }

    private static double parseAmount(String s) {
        if (s.contains("/")) {
            String[] parts = s.split("/", 2);
            return Double.parseDouble(parts[0]) / Double.parseDouble(parts[1]);
        }
        return Double.parseDouble(s.replace(",", "."));
    }

    private static String normaliseUnicode(String s) {
        return s.replace("½", "1/2")
                .replace("¼", "1/4")
                .replace("¾", "3/4")
                .replace("⅓", "1/3")
                .replace("⅔", "2/3")
                .replace("⅛", "1/8");
    }
}
