package com.streetcar.backend.service;

import com.streetcar.backend.model.Submission;
import com.streetcar.backend.repository.SubmissionRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class SubmissionService {
    private static final Sort NEWEST_FIRST = Sort.by(Sort.Direction.DESC, "id");

    private final SubmissionRepository repository;

    public SubmissionService(SubmissionRepository repository) {
        this.repository = repository;
    }

    public List<Submission> getAll() {
        return repository.findAll(NEWEST_FIRST);
    }

    public Submission getById(long id) {
        return repository.findById(id).orElseThrow(() -> notFound(id));
    }

    public Submission create(Submission input) {
        // A null id makes this an insert; an id from the client would overwrite that row.
        return repository.save(input.normalized().withIdentity(null, null));
    }

    public Submission update(long id, Submission input) {
        Submission existing = getById(id);
        return repository.save(input.normalized().withIdentity(id, existing.getCreatedAt()));
    }

    public void delete(long id) {
        if (!repository.existsById(id)) {
            throw notFound(id);
        }
        repository.deleteById(id);
    }

    private static NoSuchElementException notFound(long id) {
        return new NoSuchElementException("Submission " + id + " not found");
    }
}
