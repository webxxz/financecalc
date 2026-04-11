from pydantic import BaseModel, Field


class SaveCalculationRequest(BaseModel):
    calculator_type: str = Field(min_length=2, max_length=100)
    input_data: dict
    output_data: dict
