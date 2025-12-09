const db = require('../config/db');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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
        const result = await db.query(
            `SELECT 
                i.inspection_id, i.inspected_at, i.inspected_by, 
                e.equipment_no, e.equipment_desc,
                (SELECT COUNT(*) FROM inspection_part ip WHERE ip.inspection_id = i.inspection_id) as part_count
             FROM inspection i
             JOIN equipment e ON i.equipment_id = e.equipment_id
             ORDER BY i.inspected_at DESC`
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ 
            error: { message: "Database fetch failed: " + err.message } 
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
 * Get complete inspection plan (for report generation)
 * @route GET /api/inspection-plan/:id
 */
exports.getInspectionPlan = async (req, res) => {
    const { id } = req.params; 
    const client = await db.pool.connect();
    
    try {
        // Get inspection and equipment info
        const inspInfo = await client.query(
            `SELECT 
                i.inspection_id, i.inspected_at, i.inspected_by, 
                e.equipment_no, e.equipment_desc, e.pmt_no, e.design_code, e.image_url
             FROM inspection i
             JOIN equipment e ON i.equipment_id = e.equipment_id
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

        // Create inspection record
        const inspResult = await client.query(
            'INSERT INTO inspection (equipment_id, inspected_by, inspected_at) VALUES ($1, $2, $3) RETURNING inspection_id',
            [equipment_id, inspector_name || 'N/A', new Date(inspection_date || Date.now())]
        );
        const newInspectionId = inspResult.rows[0].inspection_id;

        // Update equipment design code if provided
        if (readings && readings.length > 0 && readings[0].design_code) {
            await client.query(
                'UPDATE equipment SET design_code = $1 WHERE equipment_id = $2',
                [readings[0].design_code, equipment_id]
            );
        }

        // Insert part readings
        for (const reading of readings) {
            if (!reading.part_id) continue;
            
            const current_risk_rating = 'LOW';
            const corrosion_group = 'Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION';

            await client.query(
                `INSERT INTO inspection_part 
                (inspection_id, part_id, part_name, phase, fluid, type, spec, grade, insulation, 
                 design_temp, design_pressure, operating_temp, operating_pressure, condition_note,
                 current_risk_rating, corrosion_group) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
                [
                    newInspectionId, reading.part_id, reading.part_name,
                    reading.phase || null, reading.fluid || null, reading.type || null,
                    reading.spec || null, reading.grade || null, reading.insulation || null,
                    reading.design_temp || null, reading.design_pressure || null,
                    reading.operating_temp || null, reading.operating_pressure || null,
                    JSON.stringify({ 
                        ut_reading: reading.ut_reading || null, 
                        visual_finding: reading.visual_finding || null 
                    }),
                    current_risk_rating, 
                    corrosion_group
                ]
            );
        }

        // Insert default inspection methods
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
        res.status(500).json({ error: { message: error.message } });
    } finally {
        client.release();
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

        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

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