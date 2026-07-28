-- ============================================================
-- Risk-Flux Seed Data — Demo posts for all sections
-- Run this in the Supabase SQL Editor AFTER 001_initial_schema.sql
-- ============================================================

-- ── AI category (not in initial schema) ─────────────────────
INSERT INTO categories (name, slug, icon) VALUES
  ('AI', 'ai', '🤖')
ON CONFLICT (slug) DO NOTHING;

-- AI subcategories
INSERT INTO subcategories (category_id, name, slug, description) VALUES
  ((SELECT id FROM categories WHERE slug = 'ai'), 'Skills',     'skills',     'AI/ML skills, tutorials, and best practices'),
  ((SELECT id FROM categories WHERE slug = 'ai'), 'Pet Projects','pet-projects','Personal AI projects and experiments'),
  ((SELECT id FROM categories WHERE slug = 'ai'), 'Agents',     'agents',     'AI agent development and frameworks')
ON CONFLICT (slug) DO NOTHING;

-- Additional Domain subcategories (to match frontend nav)
INSERT INTO subcategories (category_id, name, slug, description) VALUES
  ((SELECT id FROM categories WHERE slug = 'domain'), 'Market Risk',       'market-risk',       'Market risk measurement and management'),
  ((SELECT id FROM categories WHERE slug = 'domain'), 'Credit Risk',       'credit-risk',       'Counterparty credit risk and CVA/DVA'),
  ((SELECT id FROM categories WHERE slug = 'domain'), 'Cross Commodity',   'cross-commodity',   'Cross-commodity risk and correlation'),
  ((SELECT id FROM categories WHERE slug = 'domain'), 'FX Risk',           'fx-risk',           'Foreign exchange risk in energy trading'),
  ((SELECT id FROM categories WHERE slug = 'domain'), 'Market Data',       'market-data',       'Market data sourcing, validation, and storage'),
  ((SELECT id FROM categories WHERE slug = 'domain'), 'Risk Reporting',    'risk-reporting',    'Regulatory and internal risk reporting'),
  ((SELECT id FROM categories WHERE slug = 'domain'), 'Calculations',      'calculations',      'Risk calculation engines and methodologies')
ON CONFLICT (slug) DO NOTHING;

-- Additional Technology subcategories (to match frontend nav)
INSERT INTO subcategories (category_id, name, slug, description) VALUES
  ((SELECT id FROM categories WHERE slug = 'technology'), 'R',               'r',               'R for statistical computing and quant analysis'),
  ((SELECT id FROM categories WHERE slug = 'technology'), 'Frontend',        'frontend',        'Frontend development with React and Next.js'),
  ((SELECT id FROM categories WHERE slug = 'technology'), 'VBA & Excel',     'vba-excel',       'VBA macros and Excel automation'),
  ((SELECT id FROM categories WHERE slug = 'technology'), 'C#',              'csharp',          'C# for desktop and enterprise applications'),
  ((SELECT id FROM categories WHERE slug = 'technology'), 'Databricks on AWS','databricks-aws', 'Databricks and AWS data platform')
ON CONFLICT (slug) DO NOTHING;

-- ── Create demo admin profile ──────────────────────────────
-- (Replace with your actual Supabase auth user ID after first login)
INSERT INTO profiles (id, username, display_name, email, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'riskflux',
  'Risk-Flux',
  'admin@riskflux.com',
  'admin'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, username, display_name, email, role)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'analyst',
  'Jane Analyst',
  'jane@riskflux.com',
  'user'
) ON CONFLICT (id) DO NOTHING;

-- ── Domain: Market Risk posts ──────────────────────────────
INSERT INTO posts (id, title, slug, excerpt, content, author_id, category_id, subcategory_id, type, status, reading_time, published_at, likes_count, views_count)
VALUES
(
  gen_random_uuid(),
  'Understanding Value at Risk in Energy Markets',
  'understanding-var-in-energy-markets',
  'A comprehensive guide to VaR models — historical simulation, variance-covariance, and Monte Carlo — applied to power and gas portfolios.',
  E'Value at Risk (VaR) is one of the most widely used risk metrics in energy trading. It quantifies the maximum potential loss on a portfolio over a given time horizon at a given confidence level.\n\n## What is VaR?\n\nFormally, the VaR at confidence level alpha (e.g. 99%) over horizon T is defined as: P(Loss > VaR) = 1 - alpha\n\n## Three Main Approaches\n\n### 1. Historical Simulation\nHistorical simulation uses actual historical returns to estimate the loss distribution. No distributional assumptions are required, making it robust to fat tails common in energy markets.\n\n### 2. Variance-Covariance (Parametric)\nAssumes returns are normally distributed. Fast to compute, but underestimates tail risk in energy markets due to skewness and kurtosis.\n\n### 3. Monte Carlo Simulation\nSimulates thousands of price paths using a stochastic model (e.g. mean-reverting Ornstein-Uhlenbeck for power prices) and computes the portfolio loss distribution.\n\n## Energy Market Specifics\n\nEnergy markets exhibit unique characteristics that make standard VaR models challenging:\n- Price spikes — especially in power markets due to grid constraints\n- Seasonality — heating demand, summer cooling, hydro availability\n- Mean reversion — commodity prices tend to revert to marginal cost\n- Non-linear payoffs — options, tolling agreements, virtual power plants',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM categories WHERE slug = 'domain'),
  (SELECT id FROM subcategories WHERE slug = 'var'),
  'blog', 'published', 12,
  NOW() - INTERVAL '7 days', 47, 1240
),
(
  gen_random_uuid(),
  'PnL Attribution for Energy Trading Desks',
  'pnl-attribution-energy-trading',
  'Break down PnL into risk factor contributions — a practical guide to attributing daily P&L to shifts in price, volatility, and time decay.',
  E'## What is PnL Attribution?\n\nPnL attribution decomposes the daily profit or loss of a trading portfolio into its underlying drivers. This helps traders and risk managers understand what generated the P&L and, more importantly, whether the risks being taken align with strategy.\n\n## Key Components\n\n### 1. Price Return (Delta)\nThe P&L contribution from outright price moves. Computed as the change in underlying price multiplied by the position delta.\n\n### 2. Volatility Return (Vega)\nChanges in implied volatility affect option positions. Vega measures the sensitivity of option price to a 1% change in implied volatility.\n\n### 3. Time Decay (Theta)\nThe passage of time erodes option value. Theta quantifies the daily time decay of option positions.\n\n### 4. Cross Effects\nCorrelations between commodities and the diversification benefits (or lack thereof).\n\n## Implementation Considerations\n\nA robust attribution engine requires:\n- Clean, time-consistent price data\n- Accurate position snapshots\n- Support for both linear and non-linear instruments',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM categories WHERE slug = 'domain'),
  (SELECT id FROM subcategories WHERE slug = 'pnl'),
  'blog', 'published', 8,
  NOW() - INTERVAL '5 days', 32, 890
),
(
  gen_random_uuid(),
  'Credit Risk in Energy Trading: CVA, DVA, and Counterparty Risk',
  'credit-risk-energy-trading',
  'An overview of counterparty credit risk, Credit Valuation Adjustment (CVA), and how energy firms manage credit exposure.',
  E'Credit risk remains one of the most significant risks in over-the-counter (OTC) energy trading. Unlike exchange-traded products, OTC trades expose both parties to the risk of default.\n\n## Understanding CVA\n\nCredit Valuation Adjustment (CVA) is the market value of counterparty credit risk. It represents the difference between the risk-free portfolio value and the true portfolio value that accounts for the possibility of counterparty default.\n\n## DVA and FVA\n\nDebit Valuation Adjustment (DVA) captures the benefit of the bank\'s own credit risk. Funding Valuation Adjustment (FVA) accounts for the cost of funding the uncollateralised portion of derivatives.\n\n## Mitigation Strategies\n\n- ISDA Master Agreements\n- Credit Support Annexes (CSA)\n- Central Clearing (CCPs)\n- Collateral management',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM categories WHERE slug = 'domain'),
  (SELECT id FROM subcategories WHERE slug = 'credit-risk'),
  'blog', 'published', 10,
  NOW() - INTERVAL '3 days', 28, 675
),
(
  gen_random_uuid(),
  'Cross Commodity Risk and Correlation Modelling',
  'cross-commodity-risk',
  'How to model and hedge cross-commodity correlations in a multi-asset energy portfolio.',
  E'Energy trading desks often manage portfolios spanning crude oil, natural gas, power, coal, and emissions. Understanding cross-commodity correlations is essential for accurate risk aggregation.\n\n## Correlation Breakdowns\n\nCorrelations between commodities change through market regimes. During periods of stress, correlations tend to increase, reducing diversification benefits.\n\n## Modelling Approaches\n\n- Historical correlation matrices\n- Dynamic conditional correlation (DCC) models\n- Copula-based approaches for tail dependencies',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM categories WHERE slug = 'domain'),
  (SELECT id FROM subcategories WHERE slug = 'cross-commodity'),
  'blog', 'published', 7,
  NOW() - INTERVAL '2 days', 19, 534
)
ON CONFLICT (slug) DO NOTHING;

-- ── Technology posts ───────────────────────────────────────
INSERT INTO posts (id, title, slug, excerpt, content, author_id, category_id, subcategory_id, type, status, reading_time, published_at, likes_count, views_count)
VALUES
(
  gen_random_uuid(),
  'Python for Energy Quant Analytics',
  'python-energy-quant-analytics',
  'A curated guide to Python libraries and patterns for quantitative analysis in energy trading and risk management.',
  E'Python has become the lingua franca of quantitative finance. Here is how we use it at Risk-Flux for energy analytics.\n\n## Core Libraries\n\n- **NumPy/Pandas**: Data manipulation and array operations\n- **SciPy**: Optimisation and statistical functions\n- **scikit-learn**: Machine learning for price forecasting\n- **PyTorch**: Deep learning for volatility surface modelling\n\n## Best Practices\n\n- Use `pandas` with `pd.DataFrame` for time series analysis\n- Leverage `numba` for JIT-compiled performance on Monte Carlo simulations\n- Use `pydantic` for data validation in production pipelines',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM categories WHERE slug = 'technology'),
  (SELECT id FROM subcategories WHERE slug = 'python'),
  'blog', 'published', 6,
  NOW() - INTERVAL '6 days', 41, 1105
),
(
  gen_random_uuid(),
  'Building High-Performance APIs with FastAPI',
  'building-apis-fastapi',
  'How Risk-Flux uses FastAPI, Supabase, and async patterns to build a production-grade risk analytics API.',
  E'FastAPI provides a modern, high-performance web framework for building APIs. Here is how we structure our backend.\n\n## Why FastAPI?\n\n- Async by default\n- Automatic OpenAPI documentation\n- Pydantic-based request/response validation\n- Excellent performance (on par with Node.js and Go)\n\n## Our Architecture\n\nWe use a layered architecture:\n- **Routes** — thin endpoints that handle HTTP concerns\n- **Services** — business logic\n- **Core** — config, auth, database clients',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM categories WHERE slug = 'technology'),
  (SELECT id FROM subcategories WHERE slug = 'fastapi'),
  'blog', 'published', 5,
  NOW() - INTERVAL '4 days', 36, 956
)
ON CONFLICT (slug) DO NOTHING;

-- ── AI posts ───────────────────────────────────────────────
INSERT INTO posts (id, title, slug, excerpt, content, author_id, category_id, type, status, reading_time, published_at, likes_count, views_count)
VALUES
(
  gen_random_uuid(),
  'Machine Learning for Volatility Surface Modelling',
  'ml-volatility-surface-modelling',
  'Using neural networks to model and predict implied volatility surfaces in energy options markets.',
  E'## Why Machine Learning for Volatility?\n\nTraditional volatility surface models (SABR, SVI) are parametric and calibrated to market data. While fast, they struggle to capture the complex dynamics of energy volatility surfaces.\n\n## Our Approach\n\nWe use a hybrid model:\n- A neural network captures the non-linear relationship between market features and implied volatilities\n- A parametric layer ensures no-arbitrage constraints\n- The model recalibrates daily using the latest options settlement data',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM categories WHERE slug = 'ai'),
  'blog', 'published', 9,
  NOW() - INTERVAL '3 days', 54, 1420
),
(
  gen_random_uuid(),
  'Building AI Agents for Trade Surveillance',
  'ai-agents-trade-surveillance',
  'How we built autonomous AI agents to monitor trading activity and flag potential market abuse in real time.',
  E'## The Problem\n\nTrade surveillance generates enormous volumes of alerts, the majority of which are false positives. Traditional rule-based systems are rigid and require constant tuning.\n\n## The AI Agent Solution\n\nWe built a multi-agent system:\n- **Monitor Agent**: Ingests trade data and applies initial filters\n- **Analysis Agent**: Uses ML models to score alert severity\n- **Report Agent**: Generates formatted alerts with context and supporting evidence\n\nEach agent runs as an autonomous service, communicating via message queues.',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM categories WHERE slug = 'ai'),
  'blog', 'published', 7,
  NOW() - INTERVAL '1 day', 23, 789
)
ON CONFLICT (slug) DO NOTHING;

-- ── Blog posts ─────────────────────────────────────────────
INSERT INTO posts (id, title, slug, excerpt, content, author_id, category_id, type, status, reading_time, published_at, likes_count, views_count)
VALUES
(
  gen_random_uuid(),
  'Navigating the Energy Transition: A Risk Perspective',
  'navigating-energy-transition-risk',
  'The energy transition is reshaping risk management. Here is what every energy risk professional needs to know.',
  E'The shift from fossil fuels to renewable energy sources presents unprecedented challenges for risk managers.\n\n## New Risk Factors\n\n- Intermittency risk from renewable generation\n- Carbon price volatility\n- Regulatory uncertainty across jurisdictions\n- Technology risk from emerging storage solutions\n\n## Adapting Risk Frameworks\n\nTraditional VaR and stress testing frameworks need to evolve to capture these new risk dimensions.',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM categories WHERE slug = 'blog'),
  'blog', 'published', 6,
  NOW() - INTERVAL '8 days', 38, 876
)
ON CONFLICT (slug) DO NOTHING;

-- ── Tag associations ───────────────────────────────────────
-- Get post IDs after insert
DO $$
DECLARE
  var_post_id UUID;
  pnl_post_id UUID;
  credit_post_id UUID;
  cross_post_id UUID;
  python_post_id UUID;
  fastapi_post_id UUID;
  ml_post_id UUID;
  agent_post_id UUID;
  transition_post_id UUID;
BEGIN
  SELECT id INTO var_post_id FROM posts WHERE slug = 'understanding-var-in-energy-markets';
  SELECT id INTO pnl_post_id FROM posts WHERE slug = 'pnl-attribution-energy-trading';
  SELECT id INTO credit_post_id FROM posts WHERE slug = 'credit-risk-energy-trading';
  SELECT id INTO cross_post_id FROM posts WHERE slug = 'cross-commodity-risk';
  SELECT id INTO python_post_id FROM posts WHERE slug = 'python-energy-quant-analytics';
  SELECT id INTO fastapi_post_id FROM posts WHERE slug = 'building-apis-fastapi';
  SELECT id INTO ml_post_id FROM posts WHERE slug = 'ml-volatility-surface-modelling';
  SELECT id INTO agent_post_id FROM posts WHERE slug = 'ai-agents-trade-surveillance';
  SELECT id INTO transition_post_id FROM posts WHERE slug = 'navigating-energy-transition-risk';

  -- Tag links
  INSERT INTO post_tags (post_id, tag_id) SELECT var_post_id, id FROM tags WHERE slug = 'var' ON CONFLICT DO NOTHING;
  INSERT INTO post_tags (post_id, tag_id) SELECT var_post_id, id FROM tags WHERE slug = 'risk-management' ON CONFLICT DO NOTHING;
  INSERT INTO post_tags (post_id, tag_id) SELECT var_post_id, id FROM tags WHERE slug = 'energy-trading' ON CONFLICT DO NOTHING;

  INSERT INTO post_tags (post_id, tag_id) SELECT pnl_post_id, id FROM tags WHERE slug = 'pnl' ON CONFLICT DO NOTHING;
  INSERT INTO post_tags (post_id, tag_id) SELECT pnl_post_id, id FROM tags WHERE slug = 'energy-trading' ON CONFLICT DO NOTHING;

  INSERT INTO post_tags (post_id, tag_id) SELECT credit_post_id, id FROM tags WHERE slug = 'risk-management' ON CONFLICT DO NOTHING;
  INSERT INTO post_tags (post_id, tag_id) SELECT credit_post_id, id FROM tags WHERE slug = 'energy-trading' ON CONFLICT DO NOTHING;

  INSERT INTO post_tags (post_id, tag_id) SELECT python_post_id, id FROM tags WHERE slug = 'python' ON CONFLICT DO NOTHING;
  INSERT INTO post_tags (post_id, tag_id) SELECT python_post_id, id FROM tags WHERE slug = 'energy-trading' ON CONFLICT DO NOTHING;

  INSERT INTO post_tags (post_id, tag_id) SELECT fastapi_post_id, id FROM tags WHERE slug = 'fastapi' ON CONFLICT DO NOTHING;
  INSERT INTO post_tags (post_id, tag_id) SELECT fastapi_post_id, id FROM tags WHERE slug = 'python' ON CONFLICT DO NOTHING;

  INSERT INTO post_tags (post_id, tag_id) SELECT ml_post_id, id FROM tags WHERE slug = 'machine-learning' ON CONFLICT DO NOTHING;
  INSERT INTO post_tags (post_id, tag_id) SELECT ml_post_id, id FROM tags WHERE slug = 'volatility' ON CONFLICT DO NOTHING;

  INSERT INTO post_tags (post_id, tag_id) SELECT agent_post_id, id FROM tags WHERE slug = 'machine-learning' ON CONFLICT DO NOTHING;
  INSERT INTO post_tags (post_id, tag_id) SELECT agent_post_id, id FROM tags WHERE slug = 'risk-management' ON CONFLICT DO NOTHING;

  INSERT INTO post_tags (post_id, tag_id) SELECT transition_post_id, id FROM tags WHERE slug = 'energy-trading' ON CONFLICT DO NOTHING;
  INSERT INTO post_tags (post_id, tag_id) SELECT transition_post_id, id FROM tags WHERE slug = 'risk-management' ON CONFLICT DO NOTHING;
END $$;

-- ── Sample comments ────────────────────────────────────────
DO $$
DECLARE
  var_post_id UUID;
  python_post_id UUID;
  comment1_id UUID;
BEGIN
  SELECT id INTO var_post_id FROM posts WHERE slug = 'understanding-var-in-energy-markets';
  SELECT id INTO python_post_id FROM posts WHERE slug = 'python-energy-quant-analytics';

  -- Insert comments on VaR post
  INSERT INTO comments (id, post_id, user_id, content, created_at)
  VALUES (
    gen_random_uuid(), var_post_id,
    '00000000-0000-0000-0000-000000000002',
    E'Great overview! One thing to add — for power specifically, the seasonality adjustment in VaR models is critical. We saw significant improvements after incorporating monthly volatility scaling factors.',
    NOW() - INTERVAL '6 days'
  ) RETURNING id INTO comment1_id;

  INSERT INTO comments (id, post_id, user_id, parent_id, content, created_at)
  VALUES (
    gen_random_uuid(), var_post_id,
    '00000000-0000-0000-0000-000000000001',
    E'Good point, Jane. Seasonality is often overlooked. We have found that a regime-switching model (normal vs. stress) also improves VaR accuracy for power portfolios.',
    NOW() - INTERVAL '5 days'
  );

  INSERT INTO comments (id, post_id, user_id, parent_id, content, created_at)
  VALUES (
    gen_random_uuid(), var_post_id,
    '00000000-0000-0000-0000-000000000002',
    E'Absolutely. Are you using a Markov switching model or something simpler like threshold-based regimes?',
    NOW() - INTERVAL '5 days'
  );

  INSERT INTO comments (id, post_id, user_id, parent_id, content, created_at)
  VALUES (
    gen_random_uuid(), var_post_id,
    '00000000-0000-0000-0000-000000000001',
    E'We use a threshold-based approach for now — calibrated to the P99/P99.5 level. Markov switching is on the roadmap for Q3 though.',
    NOW() - INTERVAL '4 days'
  );

  -- Comments on Python post
  INSERT INTO comments (id, post_id, user_id, content, created_at)
  VALUES (
    gen_random_uuid(), python_post_id,
    '00000000-0000-0000-0000-000000000002',
    E'Would love to see a follow-up post on using Polars vs Pandas for time-series data. We are evaluating the switch at our desk.',
    NOW() - INTERVAL '3 days'
  );
END $$;
