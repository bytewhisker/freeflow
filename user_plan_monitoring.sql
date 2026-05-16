-- Create a view to easily monitor user plans
CREATE OR REPLACE VIEW user_plan_summary AS
SELECT 
    p.plan,
    au.email,
    au.created_at as user_created_at,
    p.updated_at as plan_updated_at,
    CASE 
        WHEN p.plan = 'pro' THEN 'Pro User'
        WHEN p.plan = 'enterprise' THEN 'Enterprise User'
        ELSE 'Free User'
    END as plan_label
FROM profiles p
JOIN auth.users au ON p.id = au.id
ORDER BY p.updated_at DESC;

-- Query to see plan distribution
SELECT 
    plan_label,
    COUNT(*) as total_users,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM user_plan_summary 
GROUP BY plan_label 
ORDER BY total_users DESC;
