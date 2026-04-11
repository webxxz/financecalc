from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = Field(default="FinanceCalc API", alias="APP_NAME")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    api_v1_prefix: str = Field(default="/api", alias="API_V1_PREFIX")

    frontend_origin: str = Field(default="http://localhost:3000", alias="FRONTEND_ORIGIN")
    allowed_origins_raw: str = Field(default="http://localhost:3000", alias="ALLOWED_ORIGINS")
    allowed_hosts_raw: str = Field(default="localhost,127.0.0.1,testserver", alias="ALLOWED_HOSTS")
    requests_per_minute: int = Field(default=60, alias="REQUESTS_PER_MINUTE")

    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    claude_api_key: str = Field(default="", alias="CLAUDE_API_KEY")
    ai_primary_model: str = Field(default="gpt-4.1-mini", alias="AI_PRIMARY_MODEL")
    ai_fallback_model: str = Field(default="claude-3-5-haiku-latest", alias="AI_FALLBACK_MODEL")

    exchange_rate_api_key: str = Field(default="", alias="EXCHANGE_RATE_API_KEY")
    exchange_rate_api_url: str = Field(default="https://v6.exchangerate-api.com/v6", alias="EXCHANGE_RATE_API_URL")
    exchange_rate_cache_ttl_seconds: int = Field(default=86400, alias="EXCHANGE_RATE_CACHE_TTL_SECONDS")

    firebase_credentials_path: str = Field(default="", alias="FIREBASE_CREDENTIALS_PATH")
    firebase_credentials_json: str = Field(default="", alias="FIREBASE_CREDENTIALS_JSON")
    firebase_project_id: str = Field(default="", alias="FIREBASE_PROJECT_ID")

    resend_api_key: str = Field(default="", alias="RESEND_API_KEY")
    contact_to_email: str = Field(default="support@financecalc.app", alias="CONTACT_TO_EMAIL")
    contact_from_email: str = Field(default="no-reply@financecalc.app", alias="CONTACT_FROM_EMAIL")
    spam_patterns_raw: str = Field(
        default=r"https?://,\bbitcoin\b,\bcasino\b,\bloan\s+approval\b",
        alias="SPAM_PATTERNS",
    )

    @property
    def allowed_origins(self) -> List[str]:
        return [v.strip() for v in self.allowed_origins_raw.split(",") if v.strip()]

    @property
    def allowed_hosts(self) -> List[str]:
        return [v.strip() for v in self.allowed_hosts_raw.split(",") if v.strip()]

    @property
    def spam_patterns(self) -> List[str]:
        return [v.strip() for v in self.spam_patterns_raw.split(",") if v.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
