package com.pulkit.ZastraBackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulkit.ZastraBackend.client.ScrapingClient;
import com.pulkit.ZastraBackend.dto.response.*;
import com.pulkit.ZastraBackend.entity.CachedActivityData;
import com.pulkit.ZastraBackend.entity.IntegrationStatus;
import com.pulkit.ZastraBackend.entity.User;
import com.pulkit.ZastraBackend.repository.CachedActivityDataRepository;
import com.pulkit.ZastraBackend.repository.IntegrationStatusRepository;
import com.pulkit.ZastraBackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final IntegrationStatusRepository integrationRepository;
    private final UserRepository userRepository;
    private final CachedActivityDataRepository cacheRepository;
    private final ScrapingClient scrapingClient;
    private final ObjectMapper objectMapper;
    private final GamificationService gamificationService;

    // Defines the cooldown period before refreshing scraper API
    private static final int CACHE_DURATION_MINUTES = 15;

    @Transactional
    public GlobalStatsResponse getGlobalStats(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CachedActivityData cache = getOrCreateCache(user);

        // Serve Cache if valid
        if (cache.getGlobalStatsJson() != null && isCacheValid(cache.getUpdatedAt())) {
            try {
                return objectMapper.readValue(cache.getGlobalStatsJson(), GlobalStatsResponse.class);
            } catch (Exception e) {
                System.err.println("Failed to deserialize global cache, refreshing...");
            }
        }

        List<IntegrationStatus> statuses = integrationRepository.findByUser(user);

        int totalSolved = 0;
        int lcEasy = 0, lcMed = 0, lcHard = 0;
        int cfEasy = 0, cfMed = 0, cfHard = 0;
        int ccEasy = 0, ccMed = 0, ccHard = 0, ccTotal = 0;
        int gfgEasy = 0, gfgMed = 0, gfgHard = 0, gfgTotal = 0;

        for (IntegrationStatus status : statuses) {
            String platform = status.getPlatform().toLowerCase();
            String pUser = status.getPlatformUsername();
            if (pUser == null || pUser.isEmpty())
                continue;

            try {
                if ("leetcode".equals(platform)) {
                    JsonNode lcData = scrapingClient.getLeetcodeData(pUser);
                    if (lcData != null && lcData.has("solvedStats")) {
                        JsonNode stats = lcData.get("solvedStats");
                        lcEasy = stats.has("Easy") ? stats.get("Easy").asInt() : 0;
                        lcMed = stats.has("Medium") ? stats.get("Medium").asInt() : 0;
                        lcHard = stats.has("Hard") ? stats.get("Hard").asInt() : 0;
                        totalSolved += (lcEasy + lcMed + lcHard);
                    }
                } else if ("codeforces".equals(platform)) {
                    JsonNode cfData = scrapingClient.getCodeforcesData(pUser);
                    if (cfData != null && cfData.has("total_Questions")) {
                        int cfSolved = cfData.get("total_Questions").asInt();
                        totalSolved += cfSolved;
                        cfEasy = cfSolved / 2;
                        cfMed = cfSolved / 3;
                        cfHard = cfSolved - cfEasy - cfMed;
                    }
                } else if ("codechef".equals(platform)) {
                    JsonNode ccData = scrapingClient.getCodechefData(pUser);
                    if (ccData != null && ccData.has("total_problems_solved")) {
                        String solvedStr = ccData.get("total_problems_solved").asText();
                        try {
                            ccTotal = Integer.parseInt(solvedStr.replaceAll("\\D+", "")); // extract digits
                            totalSolved += ccTotal;
                            // Estimate breakdown for CodeChef
                            ccEasy = (int) (ccTotal * 0.5);
                            ccMed = (int) (ccTotal * 0.3);
                            ccHard = ccTotal - ccEasy - ccMed;
                        } catch (Exception ignored) {
                        }
                    }
                } else if ("gfg".equals(platform)) {
                    JsonNode gfgData = scrapingClient.getGfgData(pUser);
                    if (gfgData != null && gfgData.has("problems")) {
                        JsonNode problems = gfgData.get("problems");
                        gfgTotal = problems.get("total_solved").asInt();
                        totalSolved += gfgTotal;

                        if (problems.has("by_difficulty")) {
                            JsonNode diff = problems.get("by_difficulty");
                            gfgEasy = diff.has("Easy") ? diff.get("Easy").asInt() : 0;
                            gfgMed = diff.has("Medium") ? diff.get("Medium").asInt() : 0;
                            gfgHard = diff.has("Hard") ? diff.get("Hard").asInt() : 0;
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Scraping failed for " + platform + ": " + e.getMessage());
            }
        }

        System.out.println(">>> Stats Aggregated for user " + userId + ": Problems=" + totalSolved);

        // Calculate real active days from GitHub heatmap
        int activeDays = getHeatmap(userId).size();

        GlobalStatsResponse response = new GlobalStatsResponse(
                totalSolved,
                activeDays,
                new DifficultyBreakdown(
                        lcEasy + cfEasy + ccEasy + gfgEasy,
                        lcMed + cfMed + ccMed + gfgMed,
                        lcHard + cfHard + ccHard + gfgHard),
                new PlatformBreakdown(
                        new DifficultyBreakdown(lcEasy, lcMed, lcHard),
                        new DifficultyBreakdown(cfEasy, cfMed, cfHard),
                        new DifficultyBreakdown(ccEasy, ccMed, ccHard),
                        new DifficultyBreakdown(gfgEasy, gfgMed, gfgHard)));

        // Update Cache
        try {
            cache.setGlobalStatsJson(objectMapper.writeValueAsString(response));
            cacheRepository.save(cache);

            // Trigger Gamification update
            updateXp(userId, response);
        } catch (JsonProcessingException ignored) {
        }

        return response;
    }

    private void updateXp(UUID userId, GlobalStatsResponse global) {
        try {
            // We fetch the others from cache or fresh if available
            GithubStatsResponse github = getGithubStats(userId);
            ContestStatsResponse contests = getContestStats(userId);
            gamificationService.updateXpFromStats(userId, global, github, contests);
        } catch (Exception e) {
            System.err.println("XP Update failed: " + e.getMessage());
        }
    }

    @Transactional
    public GithubStatsResponse getGithubStats(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        CachedActivityData cache = getOrCreateCache(user);

        if (cache.getGithubStatsJson() != null && isCacheValid(cache.getUpdatedAt())) {
            try {
                return objectMapper.readValue(cache.getGithubStatsJson(), GithubStatsResponse.class);
            } catch (Exception ignored) {
            }
        }

        IntegrationStatus ghStatus = integrationRepository.findByUserAndPlatform(user, "github").orElse(null);
        GithubStatsResponse response = new GithubStatsResponse(0, 0, 0, List.of());

        if (ghStatus != null && ghStatus.getPlatformUsername() != null) {
            try {
                JsonNode ghData = scrapingClient.getGithubData(ghStatus.getPlatformUsername());
                int repos = ghData.has("public_repos") ? ghData.get("public_repos").asInt() : 0;
                int stars = ghData.has("total_stars_received") ? ghData.get("total_stars_received").asInt() : 0;
                int commits = ghData.has("activity_Heatmap") ? ghData.get("activity_Heatmap").size() * 5 : 0;

                response = new GithubStatsResponse(commits, repos, stars, List.of("Java", "Python", "TypeScript"));
            } catch (Exception e) {
                System.err.println("Github scraping failed: " + e.getMessage());
            }
        }

        try {
            cache.setGithubStatsJson(objectMapper.writeValueAsString(response));
            cacheRepository.save(cache);
        } catch (JsonProcessingException ignored) {
        }

        return response;
    }

    @Transactional
    public ContestStatsResponse getContestStats(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        CachedActivityData cache = getOrCreateCache(user);

        if (cache.getContestStatsJson() != null && isCacheValid(cache.getUpdatedAt())) {
            try {
                return objectMapper.readValue(cache.getContestStatsJson(), ContestStatsResponse.class);
            } catch (Exception ignored) {
            }
        }

        IntegrationStatus lcStatus = integrationRepository.findByUserAndPlatform(user, "leetcode").orElse(null);
        IntegrationStatus cfStatus = integrationRepository.findByUserAndPlatform(user, "codeforces").orElse(null);

        int totalContests = 0;
        int highestRatingCf = 0;
        int highestRatingLc = 0;

        try {
            if (lcStatus != null && lcStatus.getPlatformUsername() != null) {
                JsonNode lcData = scrapingClient.getLeetcodeData(lcStatus.getPlatformUsername());
                if (lcData != null && lcData.has("contestData") && lcData.get("contestData").has("ranking")
                        && !lcData.get("contestData").get("ranking").isNull()) {
                    totalContests += lcData.get("contestData").get("ranking").get("attendedContestsCount").asInt();
                    highestRatingLc = (int) lcData.get("contestData").get("ranking").get("rating").asDouble();
                }
            }
            if (cfStatus != null && cfStatus.getPlatformUsername() != null) {
                JsonNode cfData = scrapingClient.getCodeforcesData(cfStatus.getPlatformUsername());
                if (cfData != null && cfData.has("rating")) {
                    highestRatingCf = cfData.get("rating").asInt();
                    if (cfData.has("contests")) {
                        totalContests += cfData.get("contests").size();
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Contest scraping failed: " + e.getMessage());
        }

        ContestStatsResponse response = new ContestStatsResponse(
                totalContests,
                new ContestRatings(
                        new ContestRating(highestRatingLc, highestRatingLc),
                        new ContestRating(highestRatingCf, highestRatingCf)),
                List.of(
                        new ContestHistoryEntry("Codeforces", "Recent CF Contest", 100, "2024-03-01"),
                        new ContestHistoryEntry("Leetcode", "Recent LC Contest", 50, "2024-03-08")));

        try {
            cache.setContestStatsJson(objectMapper.writeValueAsString(response));
            cacheRepository.save(cache);
        } catch (JsonProcessingException ignored) {
        }

        return response;
    }

    @Transactional
    public List<HeatmapEntry> getHeatmap(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        CachedActivityData cache = getOrCreateCache(user);

        if (cache.getHeatmapJson() != null && isCacheValid(cache.getUpdatedAt())) {
            try {
                return objectMapper.readValue(cache.getHeatmapJson(), new TypeReference<List<HeatmapEntry>>() {});
            } catch (Exception ignored) {
            }
        }

        Map<String, Integer> combinedHeatmap = new HashMap<>();
        List<IntegrationStatus> statuses = integrationRepository.findByUser(user);

        for (IntegrationStatus status : statuses) {
            if (status.getPlatformUsername() == null || status.getPlatformUsername().isBlank()) {
                continue;
            }
            String platform = status.getPlatform().toLowerCase();
            try {
                if ("github".equals(platform)) {
                    JsonNode ghData = scrapingClient.getGithubData(status.getPlatformUsername());
                    mergeDateCounts(combinedHeatmap, parseDateCountList(ghData, "activity_Heatmap"));
                } else if ("codeforces".equals(platform)) {
                    JsonNode cfData = scrapingClient.getCodeforcesData(status.getPlatformUsername());
                    mergeDateCounts(combinedHeatmap, parseDateCountList(cfData, "submission_Heatmap"));
                } else if ("leetcode".equals(platform)) {
                    JsonNode lcData = scrapingClient.getLeetcodeData(status.getPlatformUsername());
                    mergeDateCounts(combinedHeatmap, parseLeetCodeCalendar(lcData));
                } else if ("codechef".equals(platform)) {
                    JsonNode ccData = scrapingClient.getCodechefData(status.getPlatformUsername());
                    mergeDateCounts(combinedHeatmap, parseCodeChefHeatmap(ccData));
                } else if ("gfg".equals(platform)) {
                    JsonNode gfgData = scrapingClient.getGfgData(status.getPlatformUsername());
                    mergeDateCounts(combinedHeatmap, parseGfgHeatmap(gfgData));
                }
            } catch (Exception e) {
                System.err.println("Heatmap scraping failed for " + platform + ": " + e.getMessage());
            }
        }

        List<HeatmapEntry> heatmap = combinedHeatmap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new HeatmapEntry(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        try {
            cache.setHeatmapJson(objectMapper.writeValueAsString(heatmap));
            cacheRepository.save(cache);
        } catch (JsonProcessingException ignored) {
        }

        return heatmap;
    }

    private Map<String, Integer> parseDateCountList(JsonNode root, String fieldName) {
        Map<String, Integer> results = new HashMap<>();
        if (root == null || !root.has(fieldName)) {
            return results;
        }
        JsonNode list = root.get(fieldName);
        if (!list.isArray()) {
            return results;
        }
        for (JsonNode entry : list) {
            String raw = entry.asText(null);
            if (raw == null) continue;
            String[] parts = raw.split(": ");
            if (parts.length != 2) continue;
            try {
                results.merge(parts[0].trim(), Integer.parseInt(parts[1].trim()), Integer::sum);
            } catch (NumberFormatException ignored) {
            }
        }
        return results;
    }

    private Map<String, Integer> parseLeetCodeCalendar(JsonNode root) {
        Map<String, Integer> results = new HashMap<>();
        if (root == null || !root.has("matchedUser")) {
            return results;
        }
        JsonNode calendarNode = root.at("/matchedUser/userCalendar/submissionCalendar");
        if (!calendarNode.isTextual()) {
            return results;
        }
        try {
            Map<String, Integer> calendar = objectMapper.readValue(calendarNode.asText(), new TypeReference<Map<String, Integer>>() {});
            calendar.forEach((date, count) -> results.merge(date, count, Integer::sum));
        } catch (Exception ignored) {
        }
        return results;
    }

    private Map<String, Integer> parseCodeChefHeatmap(JsonNode root) {
        Map<String, Integer> results = new HashMap<>();
        if (root == null || !root.has("submission_stats")) {
            return results;
        }
        JsonNode stats = root.get("submission_stats");
        if (stats.isArray()) {
            for (JsonNode item : stats) {
                String date = item.path("date").asText(null);
                int count = item.path("count").asInt(0);
                if (date != null && !date.isBlank()) {
                    results.merge(date, count, Integer::sum);
                }
            }
        }
        return results;
    }

    private Map<String, Integer> parseGfgHeatmap(JsonNode root) {
        Map<String, Integer> results = new HashMap<>();
        if (root == null || !root.has("heatmap")) {
            return results;
        }
        JsonNode heatmapNode = root.get("heatmap");
        JsonNode daily = heatmapNode.get("daily_submissions");
        if (daily != null && daily.isObject()) {
            daily.fields().forEachRemaining(entry -> {
                results.merge(entry.getKey(), entry.getValue().asInt(0), Integer::sum);
            });
        }
        return results;
    }

    private void mergeDateCounts(Map<String, Integer> base, Map<String, Integer> add) {
        add.forEach((date, value) -> base.merge(date, value, Integer::sum));
    }

    private CachedActivityData getOrCreateCache(User user) {
        return cacheRepository.findByUser(user)
                .orElseGet(() -> {
                    CachedActivityData newCache = new CachedActivityData();
                    newCache.setUser(user);
                    newCache.setUpdatedAt(Instant.now().minus(CACHE_DURATION_MINUTES + 1, ChronoUnit.MINUTES)); // force
                                                                                                                // initially
                                                                                                                // stale
                    return cacheRepository.save(newCache);
                });
    }

    private boolean isCacheValid(Instant lastUpdated) {
        if (lastUpdated == null)
            return false;
        return ChronoUnit.MINUTES.between(lastUpdated, Instant.now()) <= CACHE_DURATION_MINUTES;
    }

    @Transactional
    public void syncAll(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        CachedActivityData cache = getOrCreateCache(user);

        // Invalidate cache by setting updatedAt to yesterday
        cache.setUpdatedAt(Instant.now().minus(1, ChronoUnit.DAYS));
        cacheRepository.save(cache);

        // Call fetchers - since cache is now "invalid", these will hit the scrapers
        getHeatmap(userId);
        getGithubStats(userId);
        getContestStats(userId);
        getGlobalStats(userId); // must be last — uses heatmap for active days
    }
}
