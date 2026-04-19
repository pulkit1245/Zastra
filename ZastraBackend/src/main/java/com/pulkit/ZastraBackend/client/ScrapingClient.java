package com.pulkit.ZastraBackend.client;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class ScrapingClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public ScrapingClient(RestTemplate restTemplate, @Value("${python.api.base-url:http://127.0.0.1:8000}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    public JsonNode getGithubData(String username) {
        return restTemplate.getForObject(baseUrl + "/github/" + username, JsonNode.class);
    }

    public JsonNode getLeetcodeData(String username) {
        return restTemplate.getForObject(baseUrl + "/leetcode/" + username, JsonNode.class);
    }

    public JsonNode getCodeforcesData(String username) {
        return restTemplate.getForObject(baseUrl + "/codeforces/" + username, JsonNode.class);
    }

    public JsonNode getCodechefData(String username) {
        return restTemplate.getForObject(baseUrl + "/codechef/" + username, JsonNode.class);
    }

    public JsonNode getGfgData(String username) {
        return restTemplate.getForObject(baseUrl + "/gfg/" + username, JsonNode.class);
    }
}
