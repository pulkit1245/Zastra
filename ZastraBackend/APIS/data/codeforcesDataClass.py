from collections import defaultdict
from dataclasses import dataclass
import datetime
from typing import List
import requests
from pydantic import BaseModel
from datetime import datetime
from collections import defaultdict


@dataclass
class contestDetails : 
    contestId: int
    contestName : str
    handle : str
    rank : int
    ratingUpdateTimeSeconds: int
    oldRating : int
    newRating : int

@dataclass
class UserDetail:
    username : str
    Name : str
    rating : int
    rank : str
    maxRating : int
    maxRank : str
    avatar_url : str
    contests : List[contestDetails]
    total_Questions : int
    total_submisson : int
    submission_Heatmap : list
    profile_url :  str = ""




def count_total_problems(username : str,count : int) -> int:
    url = f"https://codeforces.com/api/user.status?handle={username}&from=1&count={count}"
    response = requests.get(url)
    json_data=response.json()
    submission_data=json_data
    if submission_data.get("status") != "OK":
        return 0

    unique_problems = set()
    submissions = submission_data.get("result", [])

    for submission in submissions:
        problem = submission.get("problem", {})
        problem_id = f"{problem.get('contestId')}-{problem.get('index')}"
        if submission.get("verdict") == "OK":
            unique_problems.add(problem_id)
        
        
    return len(unique_problems)


def count_total_submissons(username : str,count : int) -> int:
    url = f"https://codeforces.com/api/user.status?handle={username}&from=1&count={count}"
    response = requests.get(url)
    json_data=response.json()
    submission_data=json_data
    if submission_data.get("status") != "OK":
        return 0

    unique_problems = set()
    submissions = submission_data.get("result", [])

    for submission in submissions:
        problem = submission.get("problem", {})
        problem_id = f"{problem.get('contestId')}-{problem.get('index')}"
        unique_problems.add(problem_id)
        
        
    return len(unique_problems)


def get_submission_counts_per_day(submissions_data):
    counts = defaultdict(int)
    for submission in submissions_data:
        submission_date = datetime.fromtimestamp(submission['creationTimeSeconds']).date()
        counts[submission_date] += 1
    return counts

def format_counts_to_list(submissions_data):
    daily_counts = get_submission_counts_per_day(submissions_data)

    sorted_dates = sorted(daily_counts.keys())
    
    formatted_list = []
    for date in sorted_dates:
        date_str = date.strftime('%Y-%m-%d')
        count = daily_counts[date]
        formatted_list.append(f"{date_str}: {count}")
        
    return formatted_list

def scrape_codeforces(username : str):
    url = f"https://codeforces.com/api/user.info?handles={username}"
    response = requests.get(url)
    json_data = response.json()

    if json_data.get("status") != "OK":
        return None

    user_details = json_data["result"][0]
    
    url2 = f"https://codeforces.com/api/user.rating?handle={username}"
    response_contests = requests.get(url2)
    contests_json_data = response_contests.json()
    contests = contests_json_data.get('result', [])
    contestList: List[contestDetails] = []
    for contest in contests:
        contestInfo = contestDetails(
            contestId=contest['contestId'],
            contestName=contest['contestName'],
            handle=contest['handle'],
            newRating=contest['newRating'],
            oldRating=contest['oldRating'],
            rank=contest['rank'],
            ratingUpdateTimeSeconds=contest['ratingUpdateTimeSeconds']
        )
        contestList.append(contestInfo)

    # Fixed: use dynamic username instead of hardcoded handle
    url3 = f"https://codeforces.com/api/user.status?handle={username}&from=1&count=10000"
    response3 = requests.get(url3).json()
    all_submissions = response3.get('result', [])
    submission_list = format_counts_to_list(all_submissions) if all_submissions else []

    # Safely extract optional fields with .get() defaults
    first_name = user_details.get('firstName', '')
    last_name = user_details.get('lastName', '')
    full_name = f"{first_name} {last_name}".strip() or username

    profile = UserDetail(
        Name=full_name,
        maxRank=user_details.get('maxRank', 'unrated'),
        rank=user_details.get('rank', 'unrated'),
        maxRating=user_details.get('maxRating', 0),
        rating=user_details.get('rating', 0),
        avatar_url=user_details.get('avatar', ''),
        username=user_details.get('handle', username),
        contests=contestList,
        total_Questions=count_total_problems(username, 10000),
        total_submisson=count_total_submissons(username, 10000),
        submission_Heatmap=submission_list,
        profile_url=f"https://codeforces.com/profile/{username}"
    )
    return profile
