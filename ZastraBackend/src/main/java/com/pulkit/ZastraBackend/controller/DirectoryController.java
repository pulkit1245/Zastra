package com.pulkit.ZastraBackend.controller;

import com.pulkit.ZastraBackend.dto.response.PortfolioDirectoryEntry;
import com.pulkit.ZastraBackend.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/portfolio/directory")
@RequiredArgsConstructor
public class DirectoryController {

    private final PortfolioService portfolioService;

    @GetMapping
    public ResponseEntity<List<PortfolioDirectoryEntry>> getDirectory() {
        return ResponseEntity.ok(portfolioService.getDirectory());
    }
}
