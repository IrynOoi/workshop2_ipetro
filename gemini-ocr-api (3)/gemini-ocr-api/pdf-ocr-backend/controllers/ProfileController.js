const db = require('../config/db');

/**
 * Get Current User Profile
 */
exports.getProfile = async (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const userId = req.session.user.id;
        
        // Join with users table to get username (read-only) along with profile data
        const query = `
            SELECT u.username, u.role, p.* FROM users u 
            LEFT JOIN user_profiles p ON u.user_id = p.user_id 
            WHERE u.user_id = $1
        `;
        
        const result = await db.query(query, [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ 
            success: true, 
            profile: result.rows[0] 
        });

    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
};

/**
 * Update User Profile
 */
exports.updateProfile = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userId = req.session.user.id;
    const { full_name, email, phone_number, department, position, bio } = req.body;

    try {
        // Use UPSERT (Insert or Update if exists)
        const query = `
            INSERT INTO user_profiles (user_id, full_name, email, phone_number, department, position, bio, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                full_name = EXCLUDED.full_name,
                email = EXCLUDED.email,
                phone_number = EXCLUDED.phone_number,
                department = EXCLUDED.department,
                position = EXCLUDED.position,
                bio = EXCLUDED.bio,
                updated_at = NOW()
            RETURNING *
        `;

        const values = [userId, full_name, email, phone_number, department, position, bio];
        const result = await db.query(query, values);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile: result.rows[0]
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating profile' });
    }
};