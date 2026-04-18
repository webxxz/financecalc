TOOLS = {
    "calculate_credit_card_payoff": "Estimate payoff timeline for revolving credit card debt",
    "calculate_emi": "Compute loan EMI details",
    "calculate_investment_growth": "Project portfolio growth with lump sum and monthly contributions",
    "calculate_sip": "Compute SIP projection details",
    "calculate_mortgage": "Compute mortgage affordability details",
    "calculate_mortgage_refinance": "Compute refinance savings and break-even analysis",
    "calculate_tax": "Estimate tax using simplified country rates",
    "calculate_retirement": "Project retirement corpus growth",
    "calculate_retirement_withdrawal": "Estimate retirement readiness using 4% withdrawal rule assumptions",
    "convert_currency": "Convert amounts using exchange-rate provider",
}

OPENAI_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "calculate_credit_card_payoff",
            "description": "Calculate credit card payoff duration, interest paid, and target payment options.",
            "parameters": {
                "type": "object",
                "properties": {
                    "current_balance": {"type": "number"},
                    "annual_interest_rate": {"type": "number"},
                    "monthly_payment": {"type": "number"},
                },
                "required": ["current_balance", "annual_interest_rate", "monthly_payment"],
            },
        },
    },
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
            "name": "calculate_investment_growth",
            "description": "Project future portfolio value from initial investment, monthly contributions, return rate, and years.",
            "parameters": {
                "type": "object",
                "properties": {
                    "initial_investment": {"type": "number"},
                    "monthly_contribution": {"type": "number"},
                    "annual_return_rate": {"type": "number"},
                    "years": {"type": "integer"},
                },
                "required": ["initial_investment", "monthly_contribution", "annual_return_rate", "years"],
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
            "name": "calculate_retirement_withdrawal",
            "description": "Estimate required retirement portfolio and funding gap using the 4% rule (or custom safe withdrawal rate).",
            "parameters": {
                "type": "object",
                "properties": {
                    "annual_spending_needed": {"type": "number"},
                    "current_retirement_savings": {"type": "number"},
                    "safe_withdrawal_rate": {"type": "number"},
                },
                "required": ["annual_spending_needed", "current_retirement_savings"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_mortgage_refinance",
            "description": "Analyze refinancing via backend endpoint /api/mortgage-refinance for payment, interest, and break-even outcomes.",
            "parameters": {
                "type": "object",
                "properties": {
                    "current_loan_balance": {"type": "number"},
                    "current_annual_interest_rate": {"type": "number"},
                    "current_remaining_term_months": {"type": "integer"},
                    "new_annual_interest_rate": {"type": "number"},
                    "new_loan_term_months": {"type": "integer"},
                    "closing_costs": {"type": "number"},
                },
                "required": [
                    "current_loan_balance",
                    "current_annual_interest_rate",
                    "current_remaining_term_months",
                    "new_annual_interest_rate",
                    "new_loan_term_months",
                ],
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
