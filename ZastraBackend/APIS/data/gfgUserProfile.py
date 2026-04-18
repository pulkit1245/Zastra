import json
import re
import requests
from bs4 import BeautifulSoup
from dataclasses import dataclass, field
from typing import List, Dict

# Import Selenium modules
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@dataclass 
class Problem_By_Difficullty:
    School: int
    Basic: int
    Easy: int
    Medium: int
    Hard: int

@dataclass
class ProblemStats:
    total_solved: int
    by_difficulty: Problem_By_Difficullty

@dataclass
class ContestHistory:
    name: str
    rank: int
    rating_change: int

@dataclass
class ContestStats:
    current_rating: int
    stars: int
    global_rank: int
    total_users: int
    history: List[ContestHistory]

@dataclass
class SubmissionHeatmap:
    total_submissions: int
    daily_submissions: Dict[str, int]

@dataclass
class GFGUserProfile:
    name: str
    institution: str
    score: int
    problems: ProblemStats
    contest: ContestStats
    heatmap: SubmissionHeatmap
    userProfileUrl: str = ""

def fetch_problem_stats(username: str) -> ProblemStats:
    """Helper function to fetch exact problem data directly from the GFG API"""
    url = "https://practiceapi.geeksforgeeks.org/api/v1/user/problems/submissions/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Origin": "https://www.geeksforgeeks.org",
        "Referer": "https://www.geeksforgeeks.org/"
    }
    payload = {"handle": username}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                results = data.get('result', {})
                
                difficulty_stats = Problem_By_Difficullty(
                    School=len(results.get('School', {})),
                    Basic=len(results.get('Basic', {})),
                    Easy=len(results.get('Easy', {})),
                    Medium=len(results.get('Medium', {})),
                    Hard=len(results.get('Hard', {}))
                )
                
                return ProblemStats(
                    total_solved=data.get('count', 0),
                    by_difficulty=difficulty_stats
                )
    except Exception as e:
        print(f"Error fetching API data: {e}")
        
    # Fallback if API fails
    return ProblemStats(0, Problem_By_Difficullty(0, 0, 0, 0, 0))


def scrape_gfg_profile(username: str) -> GFGUserProfile:
    url = f"https://www.geeksforgeeks.org/profile/{username}"
    
    # --- 1. Setup Headless Browser (To fetch the Score from the UI) ---
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    
    driver = webdriver.Chrome(options=chrome_options)
    score = 0
    
    try:
        driver.get(url)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(@class, 'ScoreContainer_value')]"))
        )
        html = driver.page_source
        
        # Parse HTML for the score
        soup = BeautifulSoup(html, "html.parser")
        score_tags = soup.find_all('p', class_=re.compile(r"ScoreContainer_value"))
        if len(score_tags) >= 1:
            try:
                score = int(score_tags[0].text.strip().replace(',', ''))
            except ValueError:
                pass
                
    except Exception as e:
        print(f"Failed to load dynamic content: {e}")
    finally:
        driver.quit()

    # --- 2. Fetch Detailed Problem Stats from the API ---
    problem_stats = fetch_problem_stats(username)

    # --- 3. Construct Final Profile ---
    # Heatmap and Contest data remain initialized as empty until you find their specific APIs
    profile = GFGUserProfile(
        name=username,
        institution="",
        score=score,
        problems=problem_stats,
        contest=ContestStats(
            current_rating=0,
            stars=0,
            global_rank=0,
            total_users=0,
            history=[]
        ),
        heatmap=SubmissionHeatmap(
            total_submissions=0,
            daily_submissions={}
        ),
        userProfileUrl=url
    )
    
    return profile

# --- Example Usage ---
if __name__ == "__main__":
    profile_data = scrape_gfg_profile("pulkitve3hnt")
    print(f"Profile URL: {profile_data.userProfileUrl}")
    print(f"Coding Score: {profile_data.score}")
    print(f"Total Problems Solved: {profile_data.problems.total_solved}")
    print(f" - Easy: {profile_data.problems.by_difficulty.Easy}")
    print(f" - Medium: {profile_data.problems.by_difficulty.Medium}")
    print(f" - Hard: {profile_data.problems.by_difficulty.Hard}")