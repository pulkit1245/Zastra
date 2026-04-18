from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from bs4 import BeautifulSoup
import json
import re
import requests
from dataclasses import dataclass, asdict, field

@dataclass
class CodeChefProfile:
    username: str = ""
    contests_participated: str = ""
    contest_rating: str = ""
    max_rating: str = ""
    global_rank: str = ""
    country_rank: str = ""
    division: str = ""
    total_problems_solved: str = ""
    stars: int = 0
    submission_stats: list = field(default_factory=list)
    rating_history: list = field(default_factory=list)
    userProfileUrl : str= ""

def scrape_codechef(username: str) -> CodeChefProfile:
    url = f"https://www.codechef.com/users/{username}"
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.text, "html.parser")
    profile = CodeChefProfile()

    profile.username = username

    a= soup.find(class_="contest-participated-count").text.split(" ")
    cc=str(a[len(a)-1].strip())
    if cc: profile.contests_participated = cc

    rating_div = soup.find('div', class_='rating-header text-center')
    if rating_div:
        rating_number = soup.find(class_="rating-number")
        if rating_number:
            profile.contest_rating = rating_number.text.strip()
        small_tag = rating_div.find('small')
        if small_tag:
            profile.max_rating = small_tag.text.strip().replace('(', '').replace(')', '')
        inner_divs = rating_div.find_all("div")
        if len(inner_divs) > 1:
            profile.division = inner_divs[1].text.strip().replace('(', '').replace(')', '')

    global_a = soup.find('a', href='/ratings/all')
    if global_a and global_a.find('strong'):
        profile.global_rank = global_a.find('strong').text.strip()
    country_a = soup.find('a', href='/ratings/all?filterBy=Country%3DIndia')
    if country_a and country_a.find('strong'):
        profile.country_rank = country_a.find('strong').text.strip()

    stars_div = soup.find("div", class_="rating-star")
    if stars_div:
        profile.stars = len(stars_div.find_all("span"))

    section = soup.find("section", class_="rating-data-section problems-solved")
    if section:
        total_problems = section.find_all("h3")
        if total_problems:
            profile.total_problems_solved = total_problems[-1].text.strip()

    script_tags = soup.find_all("script")
    for script in script_tags:
        if script.string and "userDailySubmissionsStats" in script.string:
            match = re.search(r"userDailySubmissionsStats\s*=\s*(\[\{.*?\}\]);", script.string, re.DOTALL)
            if match:
                try:
                    profile.submission_stats = json.loads(match.group(1))
                except:
                    pass
            break

    for script in script_tags:
        if script.string and "all_rating" in script.string:
            match = re.search(r"all_rating\s*=\s*(\[\{.*?\}\]);", script.string, re.DOTALL)
            if match:
                try:
                    profile.rating_history = json.loads(match.group(1))
                except:
                    pass
            break

    profile.userProfileUrl=url

    return profile



