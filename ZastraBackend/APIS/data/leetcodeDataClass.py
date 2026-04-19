import requests
import json
from dataclasses import dataclass
from typing import Dict, List, Any, Optional

# ─── Proper Browser Headers to bypass Cloudflare bot filtering ───────────────
HEADERS = {
    "Content-Type": "application/json",
    "Referer": "https://leetcode.com",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Origin": "https://leetcode.com",
}

# ─── DataClasses ─────────────────────────────────────────────────────────────

@dataclass
class UserCalendar:
    activeYears: List[int]
    streak: int
    submissionCalendar: str

    @property
    def parsed_calendar(self) -> Dict[str, int]:
        return json.loads(self.submissionCalendar)

@dataclass
class Profile:
    ranking: int
    reputation: int
    aboutMe: str
    countryName: Optional[str]
    company: Optional[str]
    school: Optional[str]
    skillTags: List[str]
    userAvatar: str

@dataclass
class Badge:
    id: str
    displayName: str
    icon: str
    creationDate: str

@dataclass
class Contest:
    title: str
    startTime: int

@dataclass
class ContestHistoryItem:
    attended: bool
    contest: Contest
    ranking: int
    rating: float
    trendDirection: str

@dataclass
class ContestRanking:
    attendedContestsCount: int
    rating: float
    globalRanking: int
    totalParticipants: int
    topPercentage: float

@dataclass
class MatchedUser:
    username: str
    githubUrl: Optional[str]
    linkedinUrl: Optional[str]
    twitterUrl: Optional[str]
    profile: Profile
    badges: List[Badge]
    userCalendar: UserCalendar

@dataclass
class ContestData:
    ranking: Optional[ContestRanking]
    history: List[ContestHistoryItem]

@dataclass
class LeetCodeProfile:
    matchedUser: MatchedUser
    solvedStats: Dict[str, int]
    contestData: ContestData

    @classmethod
    def from_api_responses(
        cls,
        profile_data: Dict[str, Any],
        calendar_data: Dict[str, Any],
        contest_data: Dict[str, Any],
        solved_stats: Dict[str, int]
    ) -> 'LeetCodeProfile':

        # --- Build UserCalendar (safe .get fallbacks) ---
        calendar_raw = calendar_data.get('data', {}).get('matchedUser') or {}
        cal = calendar_raw.get('userCalendar') or {}
        user_calendar = UserCalendar(
            activeYears=cal.get('activeYears', []),
            streak=cal.get('streak', 0),
            submissionCalendar=cal.get('submissionCalendar', '{}')
        )

        # --- Build Profile ---
        user_raw = (profile_data.get('data') or {}).get('matchedUser') or {}
        profile_raw = user_raw.get('profile') or {}
        profile = Profile(
            ranking=profile_raw.get('ranking', 0),
            reputation=profile_raw.get('reputation', 0),
            aboutMe=profile_raw.get('aboutMe', ''),
            countryName=profile_raw.get('countryName'),
            company=profile_raw.get('company'),
            school=profile_raw.get('school'),
            skillTags=profile_raw.get('skillTags', []),
            userAvatar=profile_raw.get('userAvatar', '')
        )

        badges_raw = user_raw.get('badges') or []
        badges = [Badge(
            id=b.get('id', ''),
            displayName=b.get('displayName', ''),
            icon=b.get('icon', ''),
            creationDate=b.get('creationDate', '')
        ) for b in badges_raw]

        matched_user = MatchedUser(
            username=user_raw.get('username', ''),
            githubUrl=user_raw.get('githubUrl'),
            linkedinUrl=user_raw.get('linkedinUrl'),
            twitterUrl=user_raw.get('twitterUrl'),
            profile=profile,
            badges=badges,
            userCalendar=user_calendar
        )

        # --- Build ContestData ---
        ranking_data = (contest_data or {}).get('userContestRanking')
        contest_ranking = ContestRanking(
            attendedContestsCount=ranking_data.get('attendedContestsCount', 0),
            rating=ranking_data.get('rating', 0.0),
            globalRanking=ranking_data.get('globalRanking', 0),
            totalParticipants=ranking_data.get('totalParticipants', 0),
            topPercentage=ranking_data.get('topPercentage', 0.0)
        ) if ranking_data else None

        history_data = (contest_data or {}).get('userContestRankingHistory') or []
        history = [
            ContestHistoryItem(
                attended=item.get('attended', False),
                contest=Contest(
                    title=item.get('contest', {}).get('title', ''),
                    startTime=item.get('contest', {}).get('startTime', 0)
                ),
                ranking=item.get('ranking', 0),
                rating=item.get('rating', 0.0),
                trendDirection=item.get('trendDirection', '')
            ) for item in history_data
        ]

        return cls(
            matchedUser=matched_user,
            solvedStats=solved_stats,
            contestData=ContestData(ranking=contest_ranking, history=history)
        )


# ─── Scraper ─────────────────────────────────────────────────────────────────

from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ─── Robust Request Helper ───────────────
def get_session():
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["POST"]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session

def scrape_leetcode(username: str) -> Optional[LeetCodeProfile]:
    url = "https://leetcode.com/graphql"
    session = get_session()

    # Queries omitted for brevity in instruction, keeping them as they are in the file...
    # (The tool will handle the replacement of the block)
    
    profile_query = """
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        githubUrl
        linkedinUrl
        twitterUrl
        profile { ranking reputation aboutMe countryName company school skillTags userAvatar }
        badges { id displayName icon creationDate }
      }
    }
    """

    calendar_query = """
    query userCalendar($username: String!, $year: Int!) {
      matchedUser(username: $username) {
        userCalendar(year: $year) { activeYears streak submissionCalendar }
      }
    }
    """

    contest_query = """
    query userContests($username: String!) {
      userContestRanking(username: $username) {
        attendedContestsCount rating globalRanking totalParticipants topPercentage
      }
      userContestRankingHistory(username: $username) {
        attended contest { title startTime } ranking rating trendDirection
      }
    }
    """

    solved_stats_query = """
    query skillStats($username: String!) {
      matchedUser(username: $username) {
        submitStatsGlobal {
          acSubmissionNum { difficulty count }
        }
      }
    }
    """

    try:
        # Use session for retries and better connection management
        profile_res = session.post(url, json={"query": profile_query, "variables": {"username": username}}, headers=HEADERS, timeout=15).json()
        
        if "errors" in profile_res or not profile_res.get('data', {}).get('matchedUser'):
            print(f"LeetCode user '{username}' not found.")
            return None

        # Fetch other data points, but don't fail if they individually fail
        calendar_res = {}
        try:
            calendar_res = session.post(url, json={"query": calendar_query, "variables": {"username": username, "year": 2025}}, headers=HEADERS, timeout=10).json()
        except Exception as e:
            print(f"Calendar fetch failed for {username}: {e}")

        contest_res = {}
        try:
            contest_res = session.post(url, json={"query": contest_query, "variables": {"username": username}}, headers=HEADERS, timeout=10).json()
        except Exception as e:
            print(f"Contest fetch failed for {username}: {e}")

        stats_res = {}
        try:
            stats_res = session.post(url, json={"query": solved_stats_query, "variables": {"username": username}}, headers=HEADERS, timeout=10).json()
        except Exception as e:
            print(f"Stats fetch failed for {username}: {e}")

        solved_list = (stats_res.get('data') or {}).get('matchedUser', {})
        solved_list = solved_list.get('submitStatsGlobal', {}).get('acSubmissionNum', []) if solved_list else []
        solved_dict = {item['difficulty']: item['count'] for item in solved_list}

        return LeetCodeProfile.from_api_responses(
            profile_data=profile_res,
            calendar_data=calendar_res,
            contest_data=contest_res.get('data'),
            solved_stats=solved_dict
        )
    except Exception as e:
        print(f"LeetCode scraping error for '{username}': {e}")
        # Re-raise to let the main handler log the full trace
        raise e