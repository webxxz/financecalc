from pydantic import BaseModel, Field


class SaveCalculationRequest(BaseModel):
    calculator_type: str = Field(min_length=2, max_length=100)
    input_data: dict
    output_data: dict


class SaveGoalRequest(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    target_amount: float = Field(gt=0)
    current_amount: float = Field(default=0, ge=0)
    target_date: str | None = Field(default=None, max_length=30)
    notes: str | None = Field(default=None, max_length=2000)


class UpdateGoalRequest(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    target_amount: float | None = Field(default=None, gt=0)
    current_amount: float | None = Field(default=None, ge=0)
    target_date: str | None = Field(default=None, max_length=30)
    notes: str | None = Field(default=None, max_length=2000)
