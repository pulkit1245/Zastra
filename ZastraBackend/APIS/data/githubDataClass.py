import os

import requests
from dataclasses import dataclass
from typing import List
from datetime import datetime
from collections import defaultdict

@dataclass
class RepoDetails:
    name: str
    description: str
    language: str
    stargazers_count: int
    forks_count: int
    html_url: str
    created_at: str

@dataclass
class GitHubUserDetail:
    username: str
    name: str
    bio: str
    location: str
    public_repos: int
    followers: int
    following: int
    avatar_url: str
    profile_url: str
    repos: List[RepoDetails]
    total_stars_received: int
    activity_Heatmap: list

def get_activity_counts_per_day(events_data: list) -> defaultdict:
    """
    Parses GitHub events and maps them to a daily count.
    Note: The GitHub public events API only returns up to 300 recent events (last 90 days).
    """
    counts = defaultdict(int)
    for event in events_data:
        # GitHub returns dates in ISO format: '2024-10-07T12:09:44Z'
        date_str = event.get('created_at')
        if date_str:
            event_date = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ").date()
            counts[event_date] += 1
    return counts

def format_counts_to_list(events_data: list) -> list:
    daily_counts = get_activity_counts_per_day(events_data)
    sorted_dates = sorted(daily_counts.keys())
    
    formatted_list = []
    for date in sorted_dates:
        date_str = date.strftime('%Y-%m-%d')
        count = daily_counts[date]
        formatted_list.append(f"{date_str}: {count}")
        
    return formatted_list

def scrape_github(username: str) -> GitHubUserDetail:
    # Fetch the token from your environment variables
    # If it's not set, it defaults to None (falling back to unauthenticated 60 req/hr)
    github_token = os.getenv("GITHUB_TOKEN")
    
    # Set up the authorization header if the token exists
    headers = {}
    if github_token:
        headers["Authorization"] = f"token {github_token}"
        # Recommended by GitHub to specify the API version
        headers["Accept"] = "application/vnd.github.v3+json" 

    # 1. Fetch User Info
    user_url = f"https://api.github.com/users/{username}"
    user_response = requests.get(user_url, headers=headers)
    
    if user_response.status_code != 200:
        raise Exception(f"Failed to fetch user. HTTP Status: {user_response.status_code} - {user_response.text}")
    
    user_data = user_response.json()

    # 2. Fetch Repositories
    repos_url = f"https://api.github.com/users/{username}/repos?per_page=100"
    repos_response = requests.get(repos_url, headers=headers)
    repos_data = repos_response.json() if repos_response.status_code == 200 else []

    repo_list: List[RepoDetails] = []
    total_stars = 0
    
    for repo in repos_data:
        stars = repo.get('stargazers_count', 0)
        total_stars += stars
        
        repo_info = RepoDetails(
            name=repo.get('name', ''),
            description=repo.get('description', ''),
            language=repo.get('language', ''),
            stargazers_count=stars,
            forks_count=repo.get('forks_count', 0),
            html_url=repo.get('html_url', ''),
            created_at=repo.get('created_at', '')
        )
        repo_list.append(repo_info)

    # 3. Fetch Recent Activity
    events_url = f"https://api.github.com/users/{username}/events?per_page=100"
    events_response = requests.get(events_url, headers=headers)
    events_data = events_response.json() if events_response.status_code == 200 else []
    
    activity_list = format_counts_to_list(events_data)

    # 4. Construct Final Profile Object
    profile = GitHubUserDetail(
        username=user_data.get('login', ''),
        name=user_data.get('name', ''),
        bio=user_data.get('bio', ''),
        location=user_data.get('location', ''),
        public_repos=user_data.get('public_repos', 0),
        followers=user_data.get('followers', 0),
        following=user_data.get('following', 0),
        avatar_url=user_data.get('avatar_url', ''),
        profile_url=user_data.get('html_url', ''),
        repos=repo_list,
        total_stars_received=total_stars,
        activity_Heatmap=activity_list
    )
    
    return profile