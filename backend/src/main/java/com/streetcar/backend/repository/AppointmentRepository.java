package com.streetcar.backend.repository;

import com.streetcar.backend.model.AdvisingAppointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<AdvisingAppointment, Long> {
    List<AdvisingAppointment> findByAdvisorIdOrderByStartsAtAsc(Long advisorId);

    List<AdvisingAppointment> findByStudentIdOrderByStartsAtAsc(Long studentId);

    /** From {@code from} inclusive to {@code to} exclusive, such as one day. */
    List<AdvisingAppointment> findByAdvisorIdAndStartsAtGreaterThanEqualAndStartsAtLessThanOrderByStartsAtAsc(
            Long advisorId, OffsetDateTime from, OffsetDateTime to);
}
