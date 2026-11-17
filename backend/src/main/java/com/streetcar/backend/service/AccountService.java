package com.streetcar.backend.service;

import com.streetcar.backend.model.AccountInfo;
import com.streetcar.backend.model.AuthenticatedUser;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.StudentProfileRepository;
import com.streetcar.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

/** The signed-in user's own account page, built from their users row and the tables related to it. */
@Service
public class AccountService {
    private final UserRepository users;
    private final StudentProfileRepository studentProfiles;
    private final AlumniService alumni;
    private final AppointmentService appointments;

    public AccountService(UserRepository users, StudentProfileRepository studentProfiles,
                          AlumniService alumni, AppointmentService appointments) {
        this.users = users;
        this.studentProfiles = studentProfiles;
        this.alumni = alumni;
        this.appointments = appointments;
    }

    @Transactional(readOnly = true)
    public AccountInfo account(AuthenticatedUser who) {
        User user = users.findById(who.id())
                .orElseThrow(() -> new NoSuchElementException("Account " + who.id() + " not found"));
        AccountRole role = AccountRole.valueOf(user.getRole());
        return switch (role) {
            case STUDENT -> new AccountInfo(user.getId(), user.getDisplayName(), user.getEmail(), role.name(),
                    studentProfiles.findById(user.getId()).map(p -> p.getClassYear()).orElse(null), null,
                    user.getSubmissions().size(), appointments.forAccount(user),
                    alumni.accountConversationsForStudent(user.getId()));
            case ADVISOR -> new AccountInfo(user.getId(), user.getDisplayName(), user.getEmail(), role.name(),
                    null, null, 0, appointments.forAccount(user), List.of());
            case ALUMNI -> new AccountInfo(user.getId(), user.getDisplayName(), user.getEmail(), role.name(),
                    null, alumni.profile(user.getId())
                            .map(p -> new AccountInfo.Alumni(p.getSchool(), p.getGradYear(), p.getJobTitle(), p.getCity()))
                            .orElse(null),
                    0, List.of(), alumni.accountConversationsForAlumnus(user.getId()));
        };
    }
}
