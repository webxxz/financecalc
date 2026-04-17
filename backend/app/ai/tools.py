TOOLS = {
    "calculate_emi": "Compute loan EMI details",
    "calculate_sip": "Compute SIP projection details",
    "calculate_mortgage": "Compute mortgage affordability details",
    "calculate_tax": "Estimate tax using simplified country rates",
    "calculate_retirement": "Project retirement corpus growth",
    "convert_currency": "Convert amounts using exchange-rate provider",
}

OPENAI_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "calculate_emi",
            "description": "Calculate EMI based on principal, annual interest rate, and tenure in months.",
            "parameters": {
                "type": "object",
                "properties": {
                    "principal": {"type": "number"},
                    "annual_interest_rate": {"type": "number"},
                    "tenure_months": {"type": "integer"},
                },
                "required": ["principal", "annual_interest_rate", "tenure_months"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_sip",
            "description": "Calculate SIP projection based on monthly investment, annual return rate, and years.",
            "parameters": {
                "type": "object",
                "properties": {
                    "monthly_investment": {"type": "number"},
                    "annual_return_rate": {"type": "number"},
                    "years": {"type": "integer"},
                },
                "required": ["monthly_investment", "annual_return_rate", "years"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_mortgage",
            "description": "Calculate mortgage affordability and monthly obligations.",
            "parameters": {
                "type": "object",
                "properties": {
                    "property_price": {"type": "number"},
                    "down_payment": {"type": "number"},
                    "annual_interest_rate": {"type": "number"},
                    "tenure_years": {"type": "integer"},
                    "annual_property_tax": {"type": "number"},
                    "annual_home_insurance": {"type": "number"},
                },
                "required": ["property_price", "down_payment", "annual_interest_rate", "tenure_years"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_tax",
            "description": "Estimate tax from annual income, deductions, and country code.",
            "parameters": {
                "type": "object",
                "properties": {
                    "annual_income": {"type": "number"},
                    "deductions": {"type": "number"},
                    "country_code": {"type": "string"},
                },
                "required": ["annual_income"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_retirement",
            "description": "Project retirement corpus from current savings and yearly contributions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "current_savings": {"type": "number"},
                    "annual_contribution": {"type": "number"},
                    "expected_annual_return_rate": {"type": "number"},
                    "years_to_retirement": {"type": "integer"},
                },
                "required": [
                    "current_savings",
                    "annual_contribution",
                    "expected_annual_return_rate",
                    "years_to_retirement",
                ],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "convert_currency",
            "description": "Convert amount from base currency to target currency using live rates.",
            "parameters": {
                "type": "object",
                "properties": {
                    "base_currency": {"type": "string"},
                    "target_currency": {"type": "string"},
                    "amount": {"type": "number"},
                },
                "required": ["base_currency", "target_currency", "amount"],
            },
        },
    },
]
