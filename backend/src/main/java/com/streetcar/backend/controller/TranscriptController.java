package com.streetcar.backend.controller;

import com.streetcar.backend.model.TranscriptResult;
import com.streetcar.backend.service.TranscriptParserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@RestController
public class TranscriptController {
    private final TranscriptParserService transcriptParserService;

    public TranscriptController(TranscriptParserService transcriptParserService) {
        this.transcriptParserService = transcriptParserService;
    }

    @PostMapping(value = "/transcript/parse", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TranscriptResult parseTranscript(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        try {
            return transcriptParserService.parse(file);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to read PDF file");
        }
    }
}
