package com.pulkit.ZastraBackend.dto.response;

/** One day's activity intensity for the heatmap calendar. */
public record HeatmapEntry(String date, int intensity) {}
