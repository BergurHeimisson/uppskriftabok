package is.bergur.uppskriftabok.repository;

import is.bergur.uppskriftabok.model.GroceryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface GroceryRepository extends JpaRepository<GroceryItem, UUID> {

    @Modifying
    @Query("DELETE FROM GroceryItem g WHERE g.checked = true")
    void deleteCompleted();
}
