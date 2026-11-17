package com.streetcar.backend.service;

/** A request that clashes with what is already saved, such as a second thread with the same alum. Sent as 409. */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
