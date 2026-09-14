package com.streetcar.backend.service;

import com.streetcar.backend.model.TranscriptResult;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class TranscriptParserService {

    private final TranscriptTextParser textParser = new TranscriptTextParser();

    public TranscriptResult parse(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            String text = new PDFTextStripper().getText(document);
            return textParser.parse(text);
        }
    }
}
