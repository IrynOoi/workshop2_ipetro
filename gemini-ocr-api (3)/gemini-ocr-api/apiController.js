const db = require('./pdf-ocr-backend/config/db');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// --- AUTH CONTROLLERS ---

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Check if user exists
        const result = await db.query(
            'SELECT * FROM users WHERE username = $1', 
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const user = result.rows[0];

        // 2. Check Password
        if (password === user.password) {
            
            // --- NEW: SAVE SESSION ---
            // This creates the "cookie" that lets them access private pages
            req.session.user = {
                id: user.user_id,
                username: user.username,
                role: user.role || 'user'
            };

            // Save session before sending response
            req.session.save(err => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.status(500).json({ success: false, message: 'Session error' });
                }

                res.json({ 
                    success: true, 
                    message: 'Login successful',
                    redirect: '/test.html', 
                    user: req.session.user 
                });
            });

        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Invalid password' 
            });
        }

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
};

exports.logout = (req, res) => {
    // Destroy the session in the database/memory
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: "Logout failed" });
        }
        // Clear the cookie on the browser
        res.clearCookie('connect.sid'); 
        res.json({ success: true, redirect: '/' });
    });
};

exports.checkAuth = (req, res) => {
    // Helper to check if user is logged in (for frontend UI)
    if (req.session.user) {
        res.json({ isAuthenticated: true, user: req.session.user });
    } else {
        res.json({ isAuthenticated: false });
    }
};

// --- EQUIPMENT CONTROLLERS ---

exports.getEquipment = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT equipment_id, equipment_no, pmt_no, equipment_desc, design_code, image_url FROM equipment WHERE is_active = true ORDER BY equipment_no'
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ error: { message: "Database fetch failed: " + error.message } });
    }
};

exports.getEquipmentList = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT e.*, 
                   (SELECT COUNT(*) FROM equipment_part ep WHERE ep.equipment_id = e.equipment_id) as parts_count
            FROM equipment e
            ORDER BY e.equipment_no
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ error: { message: "Database fetch failed: " + error.message } });
    }
};

exports.getEquipmentParts = async (req, res) => {
    try {
        const { equipment_id } = req.params;
        const result = await db.query(
            'SELECT part_id, part_name FROM equipment_part WHERE equipment_id = $1',
            [equipment_id]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ error: { message: "Database fetch failed: " + error.message } });
    }
};

exports.addEquipment = async (req, res) => {
    const { equipment_no, pmt_no, equipment_desc, design_code } = req.body;
    let { parts } = req.body;
    
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const equipResult = await client.query(
            'INSERT INTO equipment (equipment_no, pmt_no, equipment_desc, design_code, image_url, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING equipment_id',
            [equipment_no, pmt_no, equipment_desc, design_code, image_url]
        );
        const equipmentId = equipResult.rows[0].equipment_id;

        if (typeof parts === 'string') {
            try { parts = JSON.parse(parts); } catch(e) { parts = []; }
        }

        if (parts && parts.length > 0) {
            for (const partName of parts) {
                if (partName.trim()) {
                    await client.query(
                        'INSERT INTO equipment_part (equipment_id, part_name, is_active) VALUES ($1, $2, true)',
                        [equipmentId, partName.trim()]
                    );
                }
            }
        }
        await client.query('COMMIT');
        res.json({ 
            success: true, 
            message: `Equipment ${equipment_no} added successfully`,
            equipment_id: equipmentId
        });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: { message: "Failed to add equipment: " + error.message } });
    } finally {
        client.release();
    }
};

exports.editEquipment = async (req, res) => {
    const { equipment_no, pmt_no, equipment_desc, design_code } = req.body;
    const { id } = req.params;
    
    const new_image_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        let query, params;

        if (new_image_url) {
            query = 'UPDATE equipment SET equipment_no = $1, pmt_no = $2, equipment_desc = $3, design_code = $4, image_url = $5 WHERE equipment_id = $6';
            params = [equipment_no, pmt_no, equipment_desc, design_code, new_image_url, id];
        } else {
            query = 'UPDATE equipment SET equipment_no = $1, pmt_no = $2, equipment_desc = $3, design_code = $4 WHERE equipment_id = $5';
            params = [equipment_no, pmt_no, equipment_desc, design_code, id];
        }

        await client.query(query, params);
        await client.query('COMMIT');
        res.json({ success: true, message: 'Updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: { message: err.message } });
    } finally {
        client.release();
    }
};

exports.deleteEquipment = async (req, res) => {
    const { equipment_id } = req.params;
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM inspection_part WHERE inspection_id IN (SELECT inspection_id FROM inspection WHERE equipment_id = $1)', [equipment_id]);
        await client.query('DELETE FROM inspection_methods WHERE inspection_id IN (SELECT inspection_id FROM inspection WHERE equipment_id = $1)', [equipment_id]);
        await client.query('DELETE FROM inspection WHERE equipment_id = $1', [equipment_id]);
        await client.query('DELETE FROM equipment_part WHERE equipment_id = $1', [equipment_id]);
        await client.query('DELETE FROM equipment WHERE equipment_id = $1', [equipment_id]);
        await client.query('COMMIT');
        res.json({ success: true, message: 'Equipment deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: { message: "Failed to delete equipment: " + error.message } });
    } finally {
        client.release();
    }
};

// --- INSPECTION CONTROLLERS ---

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
        res.status(500).json({ error: { message: "Database fetch failed: " + err.message } });
    }
};

exports.getInspectionDetails = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM inspection_part WHERE inspection_id = $1 ORDER BY part_name',
            [req.params.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: { message: "Database fetch failed: " + err.message } });
    }
};

exports.saveData = async (req, res) => {
    const { data } = req.body;
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const { equipment_id, inspector_name, inspection_date, readings } = data;

        const inspResult = await client.query(
            'INSERT INTO inspection (equipment_id, inspected_by, inspected_at) VALUES ($1, $2, $3) RETURNING inspection_id',
            [equipment_id, inspector_name || 'N/A', new Date(inspection_date || Date.now())]
        );
        const newInspectionId = inspResult.rows[0].inspection_id;

        if (readings && readings.length > 0 && readings[0].design_code) {
            await client.query(
                'UPDATE equipment SET design_code = $1 WHERE equipment_id = $2',
                [readings[0].design_code, equipment_id]
            );
        }

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
                    JSON.stringify({ ut_reading: reading.ut_reading || null, visual_finding: reading.visual_finding || null }),
                    current_risk_rating, 
                    corrosion_group
                ]
            );
        }

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

exports.extractData = async (req, res) => {
    try {
        const { imageBase64, partsList } = req.body;
        const partNames = (partsList && partsList.length > 0) ? partsList.join(', ') : "all parts";
        
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
                        "fluid": "Vent Gas",
                        "phase": "Gas",
                        "insulation": "100",
                        "design_code": "ASME VIII DIV 1",
                        "design_temp": 500,
                        "design_pressure": 0.5,
                        "operating_temp": null,
                        "operating_pressure": null,
                        "type": "CS",
                        "spec": "SA-516",
                        "grade": "70L"
                    },
                    ... (repeat for all parts)
                ]
            }
        `;

        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        const payload = { contents: [{ parts: [ { text: prompt }, { inlineData: { mimeType: "image/png", data: imageBase64 } } ] }] };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await apiResponse.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        
        text = text.replace(/```json/g, '').replace(/```/g, '');
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) text = text.substring(firstBrace, lastBrace + 1);

        res.json({ success: true, data: JSON.parse(text) });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: { message: "AI extraction failed: " + error.message } });
    }
};

exports.getInspectionPlan = async (req, res) => {
    const { id } = req.params; 
    const client = await db.pool.connect();
    try {
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
            return res.status(404).json({ success: false, error: "Inspection not found" });
        }

        const partInfo = await client.query(
            'SELECT * FROM inspection_part WHERE inspection_id = $1 ORDER BY part_name',
            [id]
        );

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
        res.status(500).json({ error: { message: "Database fetch failed: " + err.message } });
    } finally {
        client.release();
    }
};