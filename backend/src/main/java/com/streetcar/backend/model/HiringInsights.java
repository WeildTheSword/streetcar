package com.streetcar.backend.model;

import java.util.List;

/** Where students are applying and where alumni work, for the advisor's hiring trends. */
public record HiringInsights(List<Company> studentApplications, List<Employer> alumniEmployers,
                             List<City> alumniCities, int totalApplications, int totalAlumni) {

    public record Company(String company, int applications, int interviews, int offers) {}

    public record Employer(String employer, int alumni) {}

    public record City(String city, int alumni) {}
}
