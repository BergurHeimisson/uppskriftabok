package is.bergur.uppskriftabok.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "recipes")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    private String description;

    private Integer servings;

    @Column(name = "prep_time")
    private String prepTime;

    @Column(name = "cook_time")
    private String cookTime;

    @Column(columnDefinition = "text[]")
    private String[] tags;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Ingredient> ingredients;

    @Column(columnDefinition = "text[]")
    private String[] steps;

    private String source;

    @Column(name = "prep_ahead_note")
    private String prepAheadNote;

    @Column(name = "date_added")
    private LocalDate dateAdded;

    @PrePersist
    void prePersist() {
        if (dateAdded == null) dateAdded = LocalDate.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getServings() { return servings; }
    public void setServings(Integer servings) { this.servings = servings; }

    public String getPrepTime() { return prepTime; }
    public void setPrepTime(String prepTime) { this.prepTime = prepTime; }

    public String getCookTime() { return cookTime; }
    public void setCookTime(String cookTime) { this.cookTime = cookTime; }

    public String[] getTags() { return tags; }
    public void setTags(String[] tags) { this.tags = tags; }

    public List<Ingredient> getIngredients() { return ingredients; }
    public void setIngredients(List<Ingredient> ingredients) { this.ingredients = ingredients; }

    public String[] getSteps() { return steps; }
    public void setSteps(String[] steps) { this.steps = steps; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getPrepAheadNote() { return prepAheadNote; }
    public void setPrepAheadNote(String prepAheadNote) { this.prepAheadNote = prepAheadNote; }

    public LocalDate getDateAdded() { return dateAdded; }
    public void setDateAdded(LocalDate dateAdded) { this.dateAdded = dateAdded; }
}
