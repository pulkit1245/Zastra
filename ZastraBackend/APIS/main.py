from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dataclasses import asdict
from fastapi.responses import JSONResponse

from data.codechefDataClass import scrape_codechef
from data.codeforcesDataClass import scrape_codeforces
from data.gfgUserProfile import scrape_gfg_profile
from data.leetcodeDataClass import scrape_leetcode
from data.githubDataClass import scrape_github

app = FastAPI(title="DevForge Scraping API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/github/{username}")
def get_github(username: str):
    try:
        profile = scrape_github(username)
        if not profile:
            raise HTTPException(status_code=404, detail=f"GitHub user '{username}' not found")
        return JSONResponse(content=asdict(profile), status_code=200)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/leetcode/{username}")
def get_leetcode(username: str):
    try:
        profile = scrape_leetcode(username)
        if not profile:
            raise HTTPException(status_code=404, detail=f"LeetCode user '{username}' not found")
        return JSONResponse(content=asdict(profile), status_code=200)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/codeforces/{username}")
def get_codeforces(username: str):
    try:
        profile = scrape_codeforces(username)
        if not profile:
            raise HTTPException(status_code=404, detail=f"Codeforces user '{username}' not found")
        return JSONResponse(content=asdict(profile), status_code=200)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/codechef/{username}")
def get_codechef(username: str):
    try:
        profile = scrape_codechef(username)
        if not profile:
            raise HTTPException(status_code=404, detail=f"CodeChef user '{username}' not found")
        return JSONResponse(content=asdict(profile), status_code=200)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/gfg/{username}")
def get_gfg(username: str):
    try:
        profile = scrape_gfg_profile(username)
        if not profile:
            raise HTTPException(status_code=404, detail=f"GFG user '{username}' not found")
        return JSONResponse(content=asdict(profile), status_code=200)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok", "service": "DevForge Scraping API"}