// InspectionController.js
const path = require('path');
// Explicitly point to the .env file in the parent directory
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

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
 * Update inspection details (Notes, Recommendations, Signature AND Parts Data)
 * @route POST /api/update-inspection-details
 */
exports.updateInspectionDetails = async (req, res) => {
    const { inspectionId, notes, recommendations, signature, parts } = req.body;
    
    // Use a client for transaction support
    const client = typeof db.pool !== 'undefined' ? await db.pool.connect() : await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Update Main Inspection Record (Notes & Signature)
        const combinedNotes = JSON.stringify({
            observations: notes,
            recommendations: recommendations
        });

        // Only update signature if provided, otherwise keep existing (COALESCE)
        await client.query(
            `UPDATE inspection 
             SET notes = $1, 
                 inspector_signature = COALESCE($2, inspector_signature)
             WHERE inspection_id = $3`,
            [combinedNotes, signature || null, inspectionId]
        );

        // 2. Update Parts Data (Loop through the array from frontend)
        if (parts && parts.length > 0) {
            for (const part of parts) {
                // Ensure numeric values are valid or null
                const opTemp = (part.operating_temp === '-' || part.operating_temp === '') ? null : parseFloat(part.operating_temp);
                const opPress = (part.operating_pressure === '-' || part.operating_pressure === '') ? null : parseFloat(part.operating_pressure);

                await client.query(
                    `UPDATE inspection_part 
                     SET fluid = $1,
                         part_name = $2,
                         design_code = $3,
                         type = $4,
                         spec = $5,
                         grade = $6,
                         insulation = $7,
                         operating_temp = $8,
                         operating_pressure = $9,
                         current_risk_rating = $10,
                         corrosion_group = $11
                     WHERE inspection_id = $12 AND part_id = $13`,
                    [
                        part.fluid,
                        part.part_name,
                        part.design_code,
                        part.type,
                        part.spec,
                        part.grade,
                        part.insulation,
                        opTemp,
                        opPress,
                        part.current_risk_rating,
                        part.corrosion_group,
                        inspectionId,
                        part.part_id
                    ]
                );
            }
        }

        await client.query('COMMIT');

        res.json({ 
            success: true, 
            message: 'Inspection plan updated successfully' 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Update Error:", err);
        res.status(500).json({ 
            success: false, 
            error: err.message 
        });
    } finally {
        if(client.release) client.release();
    }
};

/**
 * Get inspection history
 * @route GET /api/inspection-history
 */
exports.getInspectionHistory = async (req, res) => {
    try {
        const query = `
            SELECT 
                i.inspection_id, 
                i.inspected_at, 
                e.equipment_no, 
                e.equipment_desc, 
                u.username AS inspected_by,
                u.full_name,
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
    
    try {
        const inspInfo = await db.query(
            `SELECT 
                i.inspection_id, 
                i.inspected_at, 
                u.username AS inspected_by,
                u.full_name,
                e.equipment_no, 
                e.equipment_desc, 
                e.pmt_no, 
                e.design_code, 
                e.image_url,
                i.notes,
                i.inspector_signature
             FROM inspection i
             JOIN equipment e ON i.equipment_id = e.equipment_id
             LEFT JOIN users u ON i.inspector_id = u.user_id
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
        const partInfo = await db.query(
            'SELECT * FROM inspection_part WHERE inspection_id = $1 ORDER BY part_name',
            [id]
        );

        // Get inspection methods
        const methodInfo = await db.query(
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
        console.error("Database Error in getInspectionPlan:", err);
        res.status(500).json({ 
            success: false, 
            error: { message: "Database fetch failed: " + err.message } 
        });
    }
};

/**
 * Save inspection data to database
 * @route POST /api/save-data
 */
exports.saveData = async (req, res) => {
    const { data } = req.body;
    
    const client = typeof db.pool !== 'undefined' ? await db.pool.connect() : await db.connect();
    
    try {
        await client.query('BEGIN');
        
        const { equipment_id, inspector_name, inspection_date, readings } = data;

        // 1. LOOKUP USER ID
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
        const inspResult = await client.query(
            `INSERT INTO inspection (equipment_id, inspector_id, inspected_at) 
             VALUES ($1, $2, $3) 
             RETURNING inspection_id`,
            [equipment_id, inspectorId, new Date(inspection_date || Date.now())]
        );
        const newInspectionId = inspResult.rows[0].inspection_id;

        // 3. UPDATE EQUIPMENT DESIGN CODE (Optional)
        if (readings && readings.length > 0 && readings[0].design_code) {
            await client.query(
                'UPDATE equipment SET design_code = $1 WHERE equipment_id = $2',
                [readings[0].design_code, equipment_id]
            );
        }

        // 4. INSERT PART READINGS
        if (readings && readings.length > 0) {
            for (const reading of readings) {
                if (!reading.part_id) continue;
                
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
        if(client.release) client.release();
    }
};

// Add API endpoint to update risk rating
exports.updateRiskRating = async (req, res) => {
    const { inspectionId, partId, temperature, pressure, riskRating } = req.body;
    
    try {
        let newRiskRating = riskRating;
        
        if (!newRiskRating) {
             newRiskRating = calculateRiskRatingFromValues(temperature, pressure);
        }
        
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
 * Delete inspection plan
 * @route DELETE /api/inspection/:id
 */
exports.deleteInspection = async (req, res) => {
    const { id } = req.params;
    
    const client = typeof db.pool !== 'undefined' ? await db.pool.connect() : await db.connect();
    
    try {
        await client.query('BEGIN');
        
        await client.query('DELETE FROM inspection_methods WHERE inspection_id = $1', [id]);
        await client.query('DELETE FROM inspection_part WHERE inspection_id = $1', [id]);
        const result = await client.query('DELETE FROM inspection WHERE inspection_id = $1 RETURNING *', [id]);
        
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Inspection record not found.' });
        }

        await client.query('COMMIT');
        
        res.json({ 
            success: true, 
            message: `Inspection #${id} successfully deleted.` 
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Delete Error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete inspection record.',
            error: error.message 
        });
    } finally {
        if(client.release) client.release();
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
            3. **Insulation:** (from 'Insulations' row) only Yes or No = NIL in drawing
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

        const apiKey = process.env.GOOGLE_API_KEY;
        const MODEL_NAME = "gemini-2.0-flash";
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