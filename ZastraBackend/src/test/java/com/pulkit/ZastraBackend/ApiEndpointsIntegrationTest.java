package com.pulkit.ZastraBackend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.pulkit.ZastraBackend.client.ScrapingClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ApiEndpointsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ScrapingClient scrapingClient;

    private String jwtToken;
    private final String TEST_USERNAME = "testuser";

    @BeforeEach
    public void setupMocks() throws Exception {
        // Setup mock empty payloads for python API client to return 200 without crashing
        ObjectNode mockNode = objectMapper.createObjectNode();
        when(scrapingClient.getGithubData(anyString())).thenReturn(mockNode);
        when(scrapingClient.getLeetcodeData(anyString())).thenReturn(mockNode);
        when(scrapingClient.getCodeforcesData(anyString())).thenReturn(mockNode);
        when(scrapingClient.getCodechefData(anyString())).thenReturn(mockNode);
        when(scrapingClient.getGfgData(anyString())).thenReturn(mockNode);
    }

    private void ensureAuthenticated() throws Exception {
        if (jwtToken != null) return;
        
        // 1. Register User
        String registerJson = """
                {
                    "username": "testuser",
                    "email": "test@example.com",
                    "password": "Password123!"
                }
                """;
        // Ignore 400 if user exists, just catch and ignore
        try {
            mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(registerJson));
        } catch (Exception e) {}

        // 2. Login User
        String loginJson = """
                {
                    "email": "test@example.com",
                    "password": "Password123!"
                }
                """;
        String responseContent = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode loginResponse = objectMapper.readTree(responseContent);
        jwtToken = loginResponse.get("token").asText();
    }

    @Test
    public void testAuthEndpoints() throws Exception {
        String randomUser = "user" + System.currentTimeMillis();
        String registerJson = "{ \"username\": \"" + randomUser + "\", \"email\": \"" + randomUser + "@ex.com\", \"password\": \"Pass123!\" }";
        
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isOk());
    }

    @Test
    public void testProfileEndpoints() throws Exception {
        ensureAuthenticated();
        
        // Setup profile first via GET
        mockMvc.perform(get("/api/v1/profile")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        // Update profile
        String profileJson = """
                {
                    "displayName": "Test User",
                    "bio": "A tester",
                    "targetRoles": ["Backend"]
                }
                """;
        mockMvc.perform(put("/api/v1/profile")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(profileJson))
                .andExpect(status().isOk());
    }

    @Test
    public void testProjectEndpoints() throws Exception {
        ensureAuthenticated();

        String projectJson = """
                {
                    "title": "Test Project",
                    "description": "Integration test",
                    "sourceUrl": "http://github.com",
                    "liveUrl": "http://live.com",
                    "techStack": ["Java", "Spring"]
                }
                """;
        
        // Create project
        mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectJson))
                .andExpect(status().isOk());

        // Get projects
        mockMvc.perform(get("/api/v1/projects")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }

    @Test
    public void testIntegrationAndActivityEndpoints() throws Exception {
        ensureAuthenticated();

        // Sync platform
        String syncJson = "{ \"username\": \"testuserLc\" }";
        mockMvc.perform(post("/api/v1/integrations/leetcode/sync")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(syncJson))
                .andExpect(status().isOk());

        // Test Activity stats queries the synced python API mock
        mockMvc.perform(get("/api/v1/activity/global")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());
                
        mockMvc.perform(get("/api/v1/activity/github")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/activity/contest")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/activity/heatmap")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void testGamificationEndpoints() throws Exception {
        ensureAuthenticated();

        mockMvc.perform(get("/api/v1/gamification/summary")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/gamification/leaderboard")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());
    }

    @Test
    public void testPortfolioPublicEndpoints() throws Exception {
        ensureAuthenticated();

        mockMvc.perform(get("/api/v1/portfolio/public/" + TEST_USERNAME))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.heatmap").isArray());

        mockMvc.perform(get("/api/v1/portfolio/directory"))
                .andExpect(status().isOk());
    }
}
