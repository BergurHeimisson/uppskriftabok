package is.bergur.uppskriftabok.service;

import is.bergur.uppskriftabok.model.GroceryItem;
import is.bergur.uppskriftabok.repository.GroceryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class GroceryService {

    private final GroceryRepository repository;

    public GroceryService(GroceryRepository repository) {
        this.repository = repository;
    }

    public List<GroceryItem> findAll() {
        return repository.findAll();
    }

    public List<GroceryItem> addItems(List<GroceryItem> items) {
        items.forEach(i -> i.setId(null));
        return repository.saveAll(items);
    }

    public GroceryItem toggle(UUID id) {
        GroceryItem item = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        item.setChecked(!item.isChecked());
        return repository.save(item);
    }

    @Transactional
    public void clearCompleted() {
        repository.deleteCompleted();
    }

    public void clearAll() {
        repository.deleteAll();
    }
}
