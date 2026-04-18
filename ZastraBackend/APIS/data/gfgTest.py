import requests

def get_gfg_user_posts(username: str, page: int = 1):
    # Notice we insert the username and page dynamically into the URL
    url = f"https://communityapi.geeksforgeeks.org/post/user/{username}/?fetch_type=posts&page={page}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Origin": "https://www.geeksforgeeks.org",
        "Referer": f"https://www.geeksforgeeks.org/profile/{username}"
    }
    
    # Simple GET request
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f"Failed to fetch posts. HTTP Status: {response.status_code}")
        return None

