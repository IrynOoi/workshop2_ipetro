//inspection controller.js
const db = require('../config/db');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Add this helper function to validate temperature and pressure ranges

function validateOperatingParams(temp, pressure) {
    const errors = [];
    
    if (temp !== null && temp !== undefined && temp !== '') {
        const tempNum = parseFloat(temp);
        if (isNaN(tempNum) || tempNum < -50 || tempNum > 500) {
            errors.push(`Temperature ${temp}°C is outside valid range (-50 to 500 °C)`);
        }
    }
    
    if (pressure !== null && pressure !== undefined && pressure !== '') {
        const pressureNum = parseFloat(pressure);
        if (isNaN(pressureNum) || pressureNum < 0 || pressureNum > 10) {
            errors.push(`Pressure ${pressure} MPa is outside valid range (0 to 10 MPa)`);
        }
    }
    
    return errors;
}

// Add this helper function to calculate risk rating
function calculateRiskRatingFromValues(temp, pressure) {
    const tempValue = temp === null || temp === undefined || temp === '' ? 0 : parseFloat(temp);
    const pressureValue = pressure === null || pressure === undefined || pressure === '' ? 0 : parseFloat(pressure);
    
    if (isNaN(tempValue) || isNaN(pressureValue)) {
        return 'LOW'; // Default if invalid
    }
    
    // Updated logic for 4 risk categories
    if (tempValue > 400 || pressureValue > 8) {
        return 'HIGH';
    } else if (tempValue > 300 || pressureValue > 6) {
        return 'MEDIUM HIGH';
    } else if (tempValue > 200 || pressureValue > 5) {
        return 'MEDIUM';
    } else {
        return 'LOW';
    }
}



/**
 * Inspection Controller
 * Handles inspection logging, data extraction, and report generation
 */

/**
 * Get inspection history
 * @route GET /api/inspection-history
 */


exports.getInspectionHistory = async (req, res) => {
    try {
        // UPDATED QUERY: 
        // 1. Joins 'users' table to get the username.
        // 2. Aliases 'u.username' as 'inspected_by' so the frontend works without changes.
        const query = `
            SELECT 
                i.inspection_id, 
                i.inspected_at, 
                e.equipment_no, 
                e.equipment_desc, 
                u.username AS inspected_by,
                u.full_name,  -- <--- ADD THIS LINE to fetch the real name
                (SELECT COUNT(*) FROM inspection_part ip WHERE ip.inspection_id = i.inspection_id) as part_count
            FROM 
                inspection i
            JOIN 
                equipment e ON i.equipment_id = e.equipment_id
            LEFT JOIN 
                users u ON i.inspector_id = u.user_id
            ORDER BY 
                i.inspected_at DESC
        `;
        const { rows } = await db.query(query);

        // Send the data in the format the frontend expects
        res.status(200).json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Error fetching inspection history:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching history',
            error: error.message
        });
    }
};

/**
 * Get detailed inspection data for specific inspection
 * @route GET /api/inspection-details/:id
 */
exports.getInspectionDetails = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM inspection_part WHERE inspection_id = $1 ORDER BY part_name',
            [req.params.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ 
            error: { message: "Database fetch failed: " + err.message } 
        });
    }
};


/**
 * Check if user is admin (for edit permissions)
 * @route GET /api/check-admin
 */
exports.checkAdmin = async (req, res) => {
    try {
        // This assumes you have user info in req.user from authentication middleware
        const isAdmin = req.user && req.user.role === 'admin';
        res.json({ 
            success: true, 
            isAdmin: isAdmin 
        });
    } catch (err) {
        res.status(500).json({ 
            error: { message: "Admin check failed: " + err.message } 
        });
    }
};

/**
 * Get complete inspection plan (for report generation)
 * @route GET /api/inspection-plan/:id
 */
exports.getInspectionPlan = async (req, res) => {
    const { id } = req.params; 
    const client = await db.pool.connect();
    
    try {
        // UPDATED QUERY:
        // 1. Removed 'i.inspected_by' (column does not exist)
        // 2. Added LEFT JOIN users to get username and full_name using inspector_id
        const inspInfo = await client.query(
            `SELECT 
                i.inspection_id, 
                i.inspected_at, 
                u.username AS inspected_by,   -- Alias username so frontend works
                u.full_name,                  -- Get full name for report
                e.equipment_no, 
                e.equipment_desc, 
                e.pmt_no, 
                e.design_code, 
                e.image_url
             FROM inspection i
             JOIN equipment e ON i.equipment_id = e.equipment_id
             LEFT JOIN users u ON i.inspector_id = u.user_id -- Join with users table
             WHERE i.inspection_id = $1`,
            [id]
        );

        if (inspInfo.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: "Inspection not found" 
            });
        }

        // Get parts data
        const partInfo = await client.query(
            'SELECT * FROM inspection_part WHERE inspection_id = $1 ORDER BY part_name',
            [id]
        );

        // Get inspection methods
        const methodInfo = await client.query(
            'SELECT * FROM inspection_methods WHERE inspection_id = $1',
            [id]
        );

        res.json({
            success: true,
            data: {
                inspection: inspInfo.rows[0],
                parts: partInfo.rows,
                methods: methodInfo.rows 
            }
        });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ 
            success: false, // Ensure frontend sees this as a failure
            error: { message: "Database fetch failed: " + err.message } 
        });
    } finally {
        client.release();
    }
};

/**
 * Save inspection data to database
 * @route POST /api/save-data
 */
exports.saveData = async (req, res) => {
    const { data } = req.body;
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { equipment_id, inspector_name, inspection_date, readings } = data;

        // 1. LOOKUP USER ID
        // The frontend sends 'inspector_name' (username), but the DB needs 'inspector_id' (integer).
        let inspectorId = null;
        if (inspector_name && inspector_name !== 'Anonymous' && inspector_name !== 'N/A') {
            const userRes = await client.query(
                'SELECT user_id FROM users WHERE username = $1', 
                [inspector_name]
            );
            if (userRes.rows.length > 0) {
                inspectorId = userRes.rows[0].user_id;
            }
        }

        // 2. INSERT INTO INSPECTION TABLE
        // Uses 'inspector_id' column instead of the old 'inspected_by' column
        const inspResult = await client.query(
            `INSERT INTO inspection (equipment_id, inspector_id, inspected_at) 
             VALUES ($1, $2, $3) 
             RETURNING inspection_id`,
            [equipment_id, inspectorId, new Date(inspection_date || Date.now())]
        );
        const newInspectionId = inspResult.rows[0].inspection_id;

        // 3. UPDATE EQUIPMENT DESIGN CODE (Optional)
        // If the first reading has a design code, update the master equipment record
        if (readings && readings.length > 0 && readings[0].design_code) {
            await client.query(
                'UPDATE equipment SET design_code = $1 WHERE equipment_id = $2',
                [readings[0].design_code, equipment_id]
            );
        }

        // 4. INSERT PART READINGS
        if (readings && readings.length > 0) {
            for (const reading of readings) {
                // Skip invalid entries
                if (!reading.part_id) continue;
                
                // Calculate Risk Rating
                const current_risk_rating = calculateRiskRatingFromValues(
                    reading.operating_temp || reading.design_temp,
                    reading.operating_pressure || reading.design_pressure
                );

                const corrosion_group = 'Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION';

                await client.query(
                    `INSERT INTO inspection_part 
                    (inspection_id, part_id, part_name, phase, fluid, type, spec, grade, insulation, 
                     design_temp, design_pressure, operating_temp, operating_pressure, condition_note,
                     current_risk_rating, corrosion_group, design_code) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
                    [
                        newInspectionId, 
                        reading.part_id, 
                        reading.part_name,
                        reading.phase || null, 
                        reading.fluid || null, 
                        reading.type || null,
                        reading.spec || null, 
                        reading.grade || null, 
                        reading.insulation || null,
                        reading.design_temp || null, 
                        reading.design_pressure || null,
                        reading.operating_temp || null, 
                        reading.operating_pressure || null,
                        JSON.stringify({ 
                            ut_reading: reading.ut_reading || null, 
                            visual_finding: reading.visual_finding || null 
                        }),
                        current_risk_rating, 
                        corrosion_group,
                        reading.design_code || null
                    ]
                );
            }
        }

        // 5. INSERT DEFAULT INSPECTION METHODS
        await client.query(
            `INSERT INTO inspection_methods (inspection_id, method_name, coverage, damage_mechanism) VALUES
             ($1, 'UTTM (Correction Factor)', '100% of TML Location', 'General Corrosion'),
             ($1, 'Visual Inspection', 'External Visual Inspection (100% Coverage)', 'Atmospheric Corrosion')`,
            [newInspectionId]
        );

        await client.query('COMMIT');
        res.json({ success: true, message: 'Saved successfully' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Save Data Error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save inspection data',
            error: { message: error.message } 
        });
    } finally {
        client.release();
    }
};


// Add API endpoint to update risk rating
exports.updateRiskRating = async (req, res) => {
    const { inspectionId, partId, temperature, pressure } = req.body;
    
    try {
        // Calculate new risk rating
        const newRiskRating = calculateRiskRatingFromValues(temperature, pressure);
        
        // Update the database
        await db.query(
            `UPDATE inspection_part 
             SET current_risk_rating = $1,
                 operating_temp = $2,
                 operating_pressure = $3
             WHERE inspection_id = $4 AND part_id = $5`,
            [newRiskRating, temperature, pressure, inspectionId, partId]
        );
        
        res.json({ 
            success: true, 
            riskRating: newRiskRating,
            message: 'Risk rating updated successfully'
        });
    } catch (err) {
        res.status(500).json({ 
            error: { message: "Risk rating update failed: " + err.message } 
        });
    }
};

/**
 * Extract data from technical drawing using AI (Gemini)
 * @route POST /api/extract-data
 */
exports.extractData = async (req, res) => {
    try {
        const { imageBase64, partsList } = req.body;
        const partNames = (partsList && partsList.length > 0) 
            ? partsList.join(', ') 
            : "all parts";
        
        const prompt = `
            You are a technical data analyst.
            INPUT:
            1. Image: A technical drawing.
            2. Target Parts List: [${partNames}]

            TASK:
            Extract data by cross-referencing two tables.

            --- STEP 1: GLOBAL DATA (Design Data Table) ---
            Find the "DESIGN DATA" table (Top Right).
            Use the "SHELL SIDE" column.
            Extract these values (apply to ALL parts):
            1. **Fluid:** (from 'Fluid Name' or 'Medium')
            2. **Phase:** (Infer from Fluid. e.g., "Vent Gas" -> "Gas")
            3. **Insulation:** (from 'Insulations' row)
            4. **Design Code:** (from 'Design Code' row)
            5. **Design Pressure:** (from "Pressure" under "Design", convert Bar to MPa by x 0.1)
            6. **Design Temperature:** (from "Temperature" under "Design")
            7. **Operating Pressure:** (Find "Operating Pressure". If missing, return NULL)
            8. **Operating Temperature:** (Find "Operating Temperature". If missing, return NULL)

            --- STEP 2: PART DATA (Bill of Materials Table) ---
            Find the "BILL OF MATERIAL" table.
            For EACH part in the "Target Parts List":
            1. Find the matching row.
            2. Extract:
               - **Type** (Infer from Spec. e.g., SA516 -> "CS")
               - **Spec** (e.g., "SA-516")
               - **Grade** (e.g., "70L")

            --- STEP 3: OUTPUT JSON ---
            Return ONLY the JSON.
            {
                "inspector_name": null,
                "inspection_date": null,
                "readings": [
                    {
                        "part_name": "Top Head",
                        "fluid": "null",
                        "phase": "null",
                        "insulation": "null",
                        "design_code": "null",
                        "design_temp": null,
                        "design_pressure": null,
                        "operating_temp": null,
                        "operating_pressure": null,
                        "type": "null",
                        "spec": "null",
                        "grade": "null"
                    },
                    ... (repeat for all parts)
                ]
            }
        `;


        const apiKey = "";
        const MODEL_NAME = "gemini-2.5-flash";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

        const payload = { 
            contents: [{ 
                parts: [ 
                    { text: prompt }, 
                    { inlineData: { mimeType: "image/png", data: imageBase64 } } 
                ] 
            }] 
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await apiResponse.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        
        // Clean JSON response
        text = text.replace(/```json/g, '').replace(/```/g, '');
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        }

        res.json({ success: true, data: JSON.parse(text) });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ 
            error: { message: "AI extraction failed: " + error.message } 
        });
    }


    
};