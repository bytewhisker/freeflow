-- Fix data inconsistency: Move pro plans from settings to plan column
UPDATE profiles 
SET plan = 'pro'
WHERE settings->'profile'->>'plan' = 'pro' AND plan = 'free';

-- Verify the fix
SELECT 
    plan,
    settings->'profile'->>'plan' as settings_plan,
    COUNT(*) as user_count
FROM profiles 
GROUP BY plan, settings->'profile'->>'plan'
ORDER BY user_count DESC;
