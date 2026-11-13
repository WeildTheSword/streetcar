package com.streetcar.backend.service;

import com.streetcar.backend.model.AuthenticatedUser;
import com.streetcar.backend.model.Submission;
import com.streetcar.backend.repository.SubmissionRepository;
import com.streetcar.backend.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class SubmissionService {
    private static final Sort NEWEST_FIRST = Sort.by(Sort.Direction.DESC, "id");

    private final SubmissionRepository repository;
    private final UserRepository users;

    public SubmissionService(SubmissionRepository repository, UserRepository users) {
        this.repository = repository;
        this.users = users;
    }

    /** Everything for an advisor; only their own for a student. */
    public List<Submission> getAll(AuthenticatedUser who) {
        return who.isAdvisor()
                ? repository.findAll(NEWEST_FIRST)
                : repository.findByUserId(who.id(), NEWEST_FIRST);
    }

    /** Someone else's submission looks missing to a student, so ids can't be probed. */
    public Submission getById(long id, AuthenticatedUser who) {
        return repository.findById(id)
                .filter(submission -> who.isAdvisor() || submission.isOwnedBy(who.id()))
                .orElseThrow(() -> notFound(id));
    }

    public Submission create(Submission input, AuthenticatedUser who) {
        // A null id makes this an insert; an id from the client would overwrite that row.
        return repository.save(input.normalized().withIdentity(null, null, users.getReferenceById(who.id())));
    }

    public Submission update(long id, Submission input, AuthenticatedUser who) {
        Submission existing = getById(id, who);
        return repository.save(input.normalized().withIdentity(id, existing.getCreatedAt(), existing.getUser()));
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
