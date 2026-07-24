"""Extracts hard skills, soft skills, and requirements from raw job descriptions."""

import re

from app.schemas.job import JobAnalysis, JobDescription

HARD_SKILLS: set[str] = {
    # ── Programming Languages ──
    "python", "javascript", "typescript", "java", "c++", "c#", "golang", "go",
    "rust", "ruby", "scala", "kotlin", "swift", "r language", "r programming",
    "matlab", "bash", "shell scripting", "html", "css", "sass", "less",
    "perl", "php", "dart", "lua", "elixir", "clojure", "haskell", "groovy",
    "solidity", "objective-c", "julia", "vba", "powershell",

    # ── Web Frameworks & Libraries ──
    "react", "vue", "vue.js", "angular", "next.js", "nuxt", "svelte", "tailwind",
    "bootstrap", "jquery", "gatsby", "remix", "astro", "htmx",
    "fastapi", "django", "flask", "node.js", "express", "spring", "spring boot",
    "rails", "laravel", "symfony", "asp.net", ".net", "blazor",
    "graphql", "rest", "restful", "grpc", "websocket", "oauth", "jwt",
    "api", "rest api", "graphql api", "sdk", "webhooks",

    # ── Databases ──
    "sql", "nosql", "postgresql", "postgres", "mysql", "sqlite", "mongodb",
    "redis", "cassandra", "dynamodb", "firebase", "supabase", "elasticsearch",
    "oracle", "sql server", "mariadb", "couchdb", "neo4j", "influxdb",
    "snowflake", "bigquery", "redshift", "databricks", "dbt", "hive", "presto",

    # ── Cloud & DevOps ──
    "aws", "gcp", "azure", "google cloud", "docker", "kubernetes", "k8s",
    "terraform", "ansible", "jenkins", "linux", "unix", "git", "github", "gitlab",
    "ci/cd", "github actions", "bitbucket", "helm", "pulumi", "cloudformation",
    "nginx", "apache", "microservices", "serverless", "lambda", "s3", "ec2",

    # ── Data Science & ML ──
    "pytorch", "tensorflow", "keras", "scikit-learn", "pandas", "numpy",
    "machine learning", "deep learning", "nlp", "natural language processing",
    "data science", "huggingface", "llm", "generative ai", "computer vision",
    "opencv", "matplotlib", "scipy", "jupyter", "pyspark", "apache spark",
    "hadoop", "apache kafka", "kafka", "airflow", "mlflow", "feature engineering",
    "statistical modeling", "a/b testing", "regression", "classification",

    # ── BI & Analytics ──
    "tableau", "power bi", "looker", "looker studio", "google data studio",
    "qlik", "qlikview", "domo", "metabase", "google analytics", "ga4",
    "mixpanel", "amplitude", "segment", "heap", "hotjar",
    "excel", "microsoft excel", "google sheets", "pivot tables", "vlookup",
    "data visualization", "data analysis", "data modeling", "etl", "data pipeline",
    "data warehouse", "data lake", "business intelligence",

    # ── Microsoft & Business Productivity ──
    "microsoft office", "microsoft 365", "word", "powerpoint", "outlook",
    "sharepoint", "onenote", "microsoft teams", "teams", "access", "visio",
    "google workspace", "google docs", "google slides",

    # ── Project Management & Methodology ──
    "jira", "confluence", "trello", "asana", "monday.com", "basecamp",
    "notion", "wrike", "smartsheet", "linear", "clickup", "miro",
    "agile", "scrum", "kanban", "waterfall", "lean", "six sigma", "kaizen",
    "pmp", "prince2", "safe", "tdd", "bdd", "unit testing", "open source",
    "product roadmap", "sprint planning", "retrospective",

    # ── CRM, Sales & Business Tools ──
    "salesforce", "hubspot", "marketo", "pardot", "zendesk", "freshdesk",
    "intercom", "drift", "outreach", "salesloft", "apollo", "zoominfo",
    "servicenow", "workday", "sap", "oracle", "netsuite", "dynamics 365",
    "quickbooks", "xero", "sage", "netsuite",

    # ── Marketing Tools ──
    "google ads", "facebook ads", "meta ads", "linkedin ads", "tiktok ads",
    "seo", "sem", "ppc", "pay-per-click", "google tag manager", "adobe analytics",
    "mailchimp", "klaviyo", "constant contact", "hootsuite", "buffer",
    "semrush", "ahrefs", "moz", "screaming frog", "wordpress",
    "content marketing", "email marketing", "affiliate marketing",
    "brand management", "social media marketing", "influencer marketing",
    "conversion rate optimization", "cro", "demand generation",

    # ── Design & Creative ──
    "figma", "sketch", "adobe xd", "invision", "zeplin", "storybook",
    "photoshop", "illustrator", "indesign", "after effects", "premiere pro",
    "lightroom", "canva", "blender", "ux design", "ui design",
    "user research", "wireframing", "prototyping", "usability testing",
    "design systems", "accessibility", "wcag",

    # ── Mobile Development ──
    "ios", "android", "react native", "flutter", "swiftui", "swift ui",
    "kotlin multiplatform", "xamarin", "cordova", "ionic",

    # ── Security & Compliance ──
    "penetration testing", "ethical hacking", "vulnerability assessment",
    "cissp", "ceh", "oscp", "comptia", "siem", "soc", "iso 27001",
    "gdpr", "hipaa", "sox", "ccpa", "nist", "pci dss", "firewall", "vpn",
    "zero trust", "identity management", "iam", "privileged access",

    # ── Finance & Accounting ──
    "financial modeling", "financial analysis", "financial reporting",
    "budgeting", "forecasting", "gaap", "ifrs", "accounts payable",
    "accounts receivable", "tax", "audit", "valuation", "dcf",
    "cpa", "cfa", "cma", "acca", "bloomberg terminal",
    "equity research", "investment banking", "private equity", "venture capital",
    "portfolio management", "risk management", "derivatives", "options",

    # ── Healthcare & Life Sciences ──
    "ehr", "emr", "epic", "cerner", "hipaa", "icd-10", "cpt coding",
    "clinical documentation", "fda", "gmp", "clinical trials",
    "medical device", "biostatistics", "sas", "r statistical",

    # ── Supply Chain & Operations ──
    "erp", "supply chain management", "logistics", "procurement",
    "inventory management", "vendor management", "lean manufacturing",
    "warehouse management", "demand planning", "s&op",

    # ── Certifications & Credentials ──
    "aws certified", "google cloud certified", "microsoft certified",
    "cisco ccna", "cisco ccnp", "pmp", "scrum master", "csm",
    "safe", "itil", "six sigma", "lean six sigma", "black belt",
    "google analytics certified", "hubspot certified", "salesforce certified",
    "tableau certified",
}

SOFT_SKILLS: set[str] = {
    "communication", "leadership", "teamwork", "collaboration",
    "problem-solving", "problem solving", "attention to detail",
    "critical thinking", "time management", "adaptability",
    "creativity", "mentoring", "analytical", "self-motivated",
    "proactive", "organized", "presentation", "negotiation",
    "stakeholder management", "cross-functional", "strategic thinking",
    "detail-oriented", "results-driven", "customer-focused", "data-driven",
    "multitasking", "prioritization", "conflict resolution", "active listening",
    "coaching", "facilitation", "risk management", "continuous improvement",
    "innovation", "initiative", "accountability", "verbal communication",
    "written communication", "interpersonal skills", "decision making",
    "emotional intelligence", "empathy", "resilience", "growth mindset",
    "fast-paced", "deadline-driven", "self-starter", "relationship building",
    "customer service", "client management", "account management",
}

_BENEFIT_HEADERS: set[str] = {
    "what we offer", "benefits", "perks", "compensation", "we offer",
    "salary", "what you get", "our benefits", "equal opportunity",
    "eeo", "affirmative action", "accommodation",
}

_EXPERIENCE_RE = re.compile(
    r'(\d+)\+?\s*(?:[-–]\s*\d+\+?)?\s*years?\s+(?:of\s+[^.\n]{0,40})?experience',
    re.IGNORECASE,
)

_EDUCATION_RE = re.compile(
    r"(?:bachelor'?s?|master'?s?|phd|doctorate|associate'?s?|mba|bs|ms|ba|ma)[^\n]*",
    re.IGNORECASE,
)

_SKILL_CONTEXT_RE = re.compile(
    r'(?:experience (?:with|in|using)|profici(?:ent|ency) (?:in|with)|'
    r'knowledge of|expertise in|familiarity with|skilled in|'
    r'working knowledge of|background in|hands.on (?:with|experience))\s+'
    r'([A-Za-z][A-Za-z0-9][A-Za-z0-9\s\+\#\.\/\-]{1,25}?)(?=[,\.\n]|\s+and\s|\s+or\s|\Z)',
    re.IGNORECASE,
)


def _match_skills(text_lower: str, skill_set: set[str]) -> list[str]:
    found = []
    for skill in skill_set:
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, text_lower, re.IGNORECASE):
            found.append(skill)
    return _dedup_substrings(sorted(found))


def _dedup_substrings(skills: list[str]) -> list[str]:
    """Drop a shorter skill only when a longer compound skill covers it as a whole word.

    e.g. "lean" → dropped when "lean manufacturing" is also found.
         "excel" → dropped when "microsoft excel" is also found.
         "erp"  → kept even though "powerpoint" accidentally contains those letters.
    """
    lower_set = {s.lower() for s in skills}
    result = []
    for s in skills:
        sl = s.lower()
        absorbed = any(
            sl != other and (
                other.startswith(sl + " ")
                or other.endswith(" " + sl)
                or (" " + sl + " ") in other
            )
            for other in lower_set
        )
        if not absorbed:
            result.append(s)
    return result


def _extract_context_skills(text: str, known_hard: list[str], known_soft: list[str]) -> list[str]:
    """Extract skills from 'experience with X' patterns not already captured by the predefined lists."""
    already_found = {s.lower() for s in known_hard + known_soft}
    extracted = []
    for match in _SKILL_CONTEXT_RE.finditer(text):
        phrase = match.group(1).strip().rstrip(".,;:")
        phrase_lower = phrase.lower()
        # Skip if phrase overlaps with an already-found skill (handles "CI/CD pipelines" vs "ci/cd")
        if any(known in phrase_lower or phrase_lower in known for known in already_found):
            continue
        if (
            len(phrase) >= 2
            and len(phrase) <= 40
            and phrase_lower not in already_found
            and not any(c.isdigit() for c in phrase)
            and phrase_lower not in _BENEFIT_HEADERS
        ):
            extracted.append(phrase)
            already_found.add(phrase_lower)
    return sorted(set(extracted))


def _extract_experience(text: str) -> str | None:
    match = _EXPERIENCE_RE.search(text)
    return match.group(0).strip() if match else None


def _extract_education(text: str) -> list[str] | None:
    matches = _EDUCATION_RE.findall(text)
    cleaned = [m.strip() for m in matches if len(m.strip()) > 4]
    return cleaned if cleaned else None


def _extract_responsibilities(text: str) -> list[str]:
    lines = text.split("\n")
    responsibilities = []
    in_benefits = False

    for line in lines:
        stripped = line.strip()
        lower = stripped.lower()

        if any(h in lower for h in _BENEFIT_HEADERS):
            in_benefits = True
            continue

        if in_benefits and (lower.endswith(":") or lower.endswith("requirements")):
            in_benefits = False
            continue

        if not in_benefits and len(stripped) > 5:
            for prefix in ("--", "-", "*", "•", "·", "–"):
                if stripped.startswith(prefix):
                    content = stripped[len(prefix):].strip()
                    if content:
                        responsibilities.append(content)
                    break

    return responsibilities


def _infer_job_title(job: JobDescription) -> str:
    if job.title:
        return job.title
    for line in job.raw_text.strip().split("\n")[:4]:
        line = line.strip()
        if line and len(line) < 100 and not line.startswith("-"):
            return line
    return "Unknown Position"


def extract_keywords(job: JobDescription) -> JobAnalysis:
    text = job.raw_text
    text_lower = text.lower()

    hard_skills = _match_skills(text_lower, HARD_SKILLS)
    soft_skills = _match_skills(text_lower, SOFT_SKILLS)
    context_skills = _extract_context_skills(text, hard_skills, soft_skills)
    experience = _extract_experience(text)
    education = _extract_education(text)
    responsibilities = _extract_responsibilities(text)
    job_title = _infer_job_title(job)

    all_keywords = sorted(set(hard_skills + soft_skills + context_skills))

    return JobAnalysis(
        job_title=job_title,
        company=job.company,
        hard_skills=hard_skills + context_skills,
        soft_skills=soft_skills,
        required_experience=experience,
        education_requirements=education,
        keywords=all_keywords,
        responsibilities=responsibilities,
    )
