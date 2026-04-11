from cachetools import TTLCache


class InMemoryTTLCache:
    def __init__(self, maxsize: int = 256, ttl: int = 3600) -> None:
        self._cache = TTLCache(maxsize=maxsize, ttl=ttl)

    def get(self, key):
        return self._cache.get(key)

    def set(self, key, value):
        self._cache[key] = value
