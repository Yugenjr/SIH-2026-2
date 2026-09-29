from typing import List, Dict, Any
from models.domain import UserProfile, SchemeConfig, SchemeRule

class RulesEngine:
    @staticmethod
    def evaluate(profile: UserProfile, scheme: SchemeConfig) -> Dict[str, Any]:
        evaluations = []
        is_overall_eligible = True

        # Rule 1: Category Check
        category_match = profile.category.value == "ST"
        evaluations.append({
            "rule": "Category",
            "requirement": "Scheduled Tribe (ST)",
            "actual": profile.category.value,
            "passed": category_match,
            "status": "PASS" if category_match else "FAIL",
            "explanation": "ST category requirement satisfied" if category_match else "Only ST category students are eligible"
        })
        if not category_match:
            is_overall_eligible = False

        # Rule 2: Annual Income Check
        income_match = profile.annual_income <= scheme.max_income_limit
        evaluations.append({
            "rule": "Annual Family Income",
            "requirement": f"<= ₹{scheme.max_income_limit:,.0f}",
            "actual": f"₹{profile.annual_income:,.0f}",
            "passed": income_match,
            "status": "PASS" if income_match else "FAIL",
            "explanation": f"Income is within configured threshold of ₹{scheme.max_income_limit:,.0f}" if income_match else f"Income exceeds maximum limit of ₹{scheme.max_income_limit:,.0f}"
        })
        if not income_match:
            is_overall_eligible = False

        # Rule 3: Academic Score Check
        academic_match = profile.academic_percentage >= scheme.min_academic_score
        evaluations.append({
            "rule": "Academic Score",
            "requirement": f">= {scheme.min_academic_score}%",
            "actual": f"{profile.academic_percentage}%",
            "passed": academic_match,
            "status": "PASS" if academic_match else "FAIL",
            "explanation": "Academic score requirement satisfied" if academic_match else f"Score is below minimum required {scheme.min_academic_score}%"
        })
        if not academic_match:
            is_overall_eligible = False

        # Rule 4: Age Check
        age_match = profile.age <= scheme.max_age_limit
        evaluations.append({
            "rule": "Age Threshold",
            "requirement": f"<= {scheme.max_age_limit} years",
            "actual": f"{profile.age} years",
            "passed": age_match,
            "status": "PASS" if age_match else "FAIL",
            "explanation": "Age requirement satisfied" if age_match else f"Age exceeds maximum limit of {scheme.max_age_limit}"
        })
        if not age_match:
            is_overall_eligible = False

        return {
            "eligible": is_overall_eligible,
            "scheme_code": scheme.code,
            "scheme_name": scheme.name,
            "scheme_version": scheme.version,
            "rules_evaluated": evaluations
        }

    @staticmethod
    def simulate_impact(applications: List[Dict[str, Any]], old_income_limit: float, new_income_limit: float) -> Dict[str, Any]:
        total_evaluated = len(applications)
        newly_eligible = 0
        affected_count = 0

        for app in applications:
            income = app.get("annual_income", 200000)
            cat = app.get("category", "ST")
            score = app.get("academic_percentage", 70)
            
            was_eligible = (cat == "ST" and income <= old_income_limit and score >= 60)
            now_eligible = (cat == "ST" and income <= new_income_limit and score >= 60)

            if not was_eligible and now_eligible:
                newly_eligible += 1
                affected_count += 1
            elif was_eligible != now_eligible:
                affected_count += 1

        return {
            "total_applications_evaluated": total_evaluated,
            "old_income_limit": old_income_limit,
            "new_income_limit": new_income_limit,
            "newly_eligible_count": newly_eligible,
            "total_affected_count": affected_count,
            "impact_percentage": round((newly_eligible / max(1, total_evaluated)) * 100, 1)
        }
