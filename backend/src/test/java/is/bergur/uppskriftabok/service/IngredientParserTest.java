package is.bergur.uppskriftabok.service;

import is.bergur.uppskriftabok.model.Ingredient;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class IngredientParserTest {

    // --- amount + unit + item (concatenated) ---

    @Test
    void parsesAmountUnitAndItemConcatenated() {
        Ingredient i = parse("500g ground beef");
        assertThat(i.amount()).isEqualTo(500.0);
        assertThat(i.unit()).isEqualTo("g");
        assertThat(i.item()).isEqualTo("ground beef");
    }

    // --- amount + unit + item (space-separated) ---

    @Test
    void parsesAmountUnitAndItemSeparated() {
        Ingredient i = parse("1/2 dl breadcrumbs");
        assertThat(i.amount()).isEqualTo(0.5);
        assertThat(i.unit()).isEqualTo("dl");
        assertThat(i.item()).isEqualTo("breadcrumbs");
    }

    // --- unicode fractions ---

    @Test
    void normalisesUnicodeFractionHalf() {
        Ingredient i = parse("½ dl breadcrumbs");
        assertThat(i.amount()).isEqualTo(0.5);
        assertThat(i.unit()).isEqualTo("dl");
    }

    @Test
    void normalisesUnicodeFractionQuarter() {
        Ingredient i = parse("¼ tsp salt");
        assertThat(i.amount()).isEqualTo(0.25);
        assertThat(i.unit()).isEqualTo("tsp");
    }

    // --- amount + item, no unit ---

    @Test
    void parsesAmountAndItemWithNoUnit() {
        Ingredient i = parse("1 egg");
        assertThat(i.amount()).isEqualTo(1.0);
        assertThat(i.unit()).isEqualTo("");
        assertThat(i.item()).isEqualTo("egg");
    }

    // --- item only, no amount ---

    @Test
    void parsesItemOnlyWithNoAmount() {
        Ingredient i = parse("salt");
        assertThat(i.amount()).isNull();
        assertThat(i.unit()).isEqualTo("");
        assertThat(i.item()).isEqualTo("salt");
    }

    // --- unit alias normalisation ---

    @Test
    void normalisesGramAlias() {
        assertThat(parse("100gram flour").unit()).isEqualTo("g");
        assertThat(parse("100gr flour").unit()).isEqualTo("g");
    }

    @Test
    void normalisesTeaspoonAlias() {
        assertThat(parse("1 teaspoon salt").unit()).isEqualTo("tsp");
        assertThat(parse("1 ts salt").unit()).isEqualTo("tsp");
    }

    @Test
    void normalisesTablespoonAlias() {
        assertThat(parse("3 tablespoons olive oil").unit()).isEqualTo("tbsp");
        assertThat(parse("3 tbs olive oil").unit()).isEqualTo("tbsp");
    }

    @Test
    void normalisesCupAlias() {
        assertThat(parse("2 cups flour").unit()).isEqualTo("cup");
    }

    @Test
    void normalisesLiterAlias() {
        assertThat(parse("1 liter water").unit()).isEqualTo("l");
        assertThat(parse("1 litre water").unit()).isEqualTo("l");
    }

    // --- empty lines are ignored ---

    @Test
    void ignoresEmptyLines() {
        List<Ingredient> result = IngredientParser.parse(List.of("1 egg", "", "  ", "500g beef"));
        assertThat(result).hasSize(2);
    }

    // --- multi-word item ---

    @Test
    void parsesMultiWordItem() {
        Ingredient i = parse("2 tbsp olive oil");
        assertThat(i.amount()).isEqualTo(2.0);
        assertThat(i.unit()).isEqualTo("tbsp");
        assertThat(i.item()).isEqualTo("olive oil");
    }

    // --- unknown word after amount is treated as part of item ---

    @Test
    void treatsUnknownWordAsPartOfItem() {
        Ingredient i = parse("3 large eggs");
        assertThat(i.amount()).isEqualTo(3.0);
        assertThat(i.unit()).isEqualTo("");
        assertThat(i.item()).isEqualTo("large eggs");
    }

    private Ingredient parse(String line) {
        return IngredientParser.parse(List.of(line)).getFirst();
    }
}
