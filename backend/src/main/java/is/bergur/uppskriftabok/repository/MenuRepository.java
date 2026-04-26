package is.bergur.uppskriftabok.repository;

import is.bergur.uppskriftabok.model.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MenuRepository extends JpaRepository<Menu, UUID> {}
