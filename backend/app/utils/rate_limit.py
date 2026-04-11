from collections import defaultdict, deque
from time import time

from fastapi import HTTPException, Request


class InMemoryRateLimiter:
    def __init__(self, requests_per_window: int = 60, window_seconds: int = 60):
        self.requests_per_window = requests_per_window
        self.window_seconds = window_seconds
        self._store = defaultdict(deque)

    def check(self, request: Request) -> None:
        client_ip = (request.client.host if request.client else "unknown")
        now = time()
        bucket = self._store[client_ip]

        while bucket and (now - bucket[0]) > self.window_seconds:
            bucket.popleft()

        if len(bucket) >= self.requests_per_window:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")

        bucket.append(now)
