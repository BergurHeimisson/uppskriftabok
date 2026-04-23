package is.bergur.uppskriftabok.repository;

import is.bergur.uppskriftabok.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RecipeRepository extends JpaRepository<Recipe, UUID> {}
