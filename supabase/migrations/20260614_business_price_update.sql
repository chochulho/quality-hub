-- Business plan price: 390,000 → 290,000 KRW/mo (2,900,000/yr)
UPDATE plans
SET price_krw_monthly = 290000,
    price_krw_yearly  = 2900000
WHERE id = 'business';
