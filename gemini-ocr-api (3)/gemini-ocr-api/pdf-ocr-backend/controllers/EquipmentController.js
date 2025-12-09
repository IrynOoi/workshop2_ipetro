const db = require('../config/db');

/**
 * Equipment Controller
 * Handles all equipment CRUD operations
 */

/**
 * Get all equipment (simple list)
 * @route GET /api/equipment
 */
exports.getEquipment = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT equipment_id, equipment_no, pmt_no, equipment_desc, design_code, image_url 
             FROM equipment 
             WHERE is_active = true 
             ORDER BY equipment_no`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ 
            error: { message: "Database fetch failed: " + error.message } 
        });
    }
};

/**
 * Get equipment with parts count
 * @route GET /api/equipment-list
 */
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
        res.status(500).json({ 
            error: { message: "Database fetch failed: " + error.message } 
        });
    }
};

/**
 * Get parts for specific equipment
 * @route GET /api/equipment-parts/:equipment_id
 */
exports.getEquipmentParts = async (req, res) => {
    try {
        const { equipment_id } = req.params;
        const result = await db.query(
            'SELECT part_id, part_name FROM equipment_part WHERE equipment_id = $1',
            [equipment_id]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ 
            error: { message: "Database fetch failed: " + error.message } 
        });
    }
};

/**
 * Add new equipment with parts
 * @route POST /api/add-equipment
 */
exports.addEquipment = async (req, res) => {
    const { equipment_no, pmt_no, equipment_desc, design_code } = req.body;
    let { parts } = req.body;
    
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        // Insert equipment
        const equipResult = await client.query(
            `INSERT INTO equipment (equipment_no, pmt_no, equipment_desc, design_code, image_url, is_active) 
             VALUES ($1, $2, $3, $4, $5, true) 
             RETURNING equipment_id`,
            [equipment_no, pmt_no, equipment_desc, design_code, image_url]
        );
        const equipmentId = equipResult.rows[0].equipment_id;

        // Parse parts if string
        if (typeof parts === 'string') {
            try { 
                parts = JSON.parse(parts); 
            } catch(e) { 
                parts = []; 
            }
        }

        // Insert parts
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
        res.status(500).json({ 
            error: { message: "Failed to add equipment: " + error.message } 
        });
    } finally {
        client.release();
    }
};

/**
 * Edit existing equipment
 * @route PUT /api/edit-equipment/:id
 */
exports.editEquipment = async (req, res) => {
    const { equipment_no, pmt_no, equipment_desc, design_code } = req.body;
    const { id } = req.params;
    
    const new_image_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        let query, params;

        if (new_image_url) {
            query = `UPDATE equipment 
                     SET equipment_no = $1, pmt_no = $2, equipment_desc = $3, design_code = $4, image_url = $5 
                     WHERE equipment_id = $6`;
            params = [equipment_no, pmt_no, equipment_desc, design_code, new_image_url, id];
        } else {
            query = `UPDATE equipment 
                     SET equipment_no = $1, pmt_no = $2, equipment_desc = $3, design_code = $4 
                     WHERE equipment_id = $5`;
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

/**
 * Delete equipment and all related data
 * @route DELETE /api/delete-equipment/:equipment_id
 */
exports.deleteEquipment = async (req, res) => {
    const { equipment_id } = req.params;
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Delete in correct order to maintain referential integrity
        await client.query(
            `DELETE FROM inspection_part 
             WHERE inspection_id IN (SELECT inspection_id FROM inspection WHERE equipment_id = $1)`, 
            [equipment_id]
        );
        
        await client.query(
            `DELETE FROM inspection_methods 
             WHERE inspection_id IN (SELECT inspection_id FROM inspection WHERE equipment_id = $1)`, 
            [equipment_id]
        );
        
        await client.query(
            'DELETE FROM inspection WHERE equipment_id = $1', 
            [equipment_id]
        );
        
        await client.query(
            'DELETE FROM equipment_part WHERE equipment_id = $1', 
            [equipment_id]
        );
        
        await client.query(
            'DELETE FROM equipment WHERE equipment_id = $1', 
            [equipment_id]
        );
        
        await client.query('COMMIT');
        
        res.json({ success: true, message: 'Equipment deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ 
            error: { message: "Failed to delete equipment: " + error.message } 
        });
    } finally {
        client.release();
    }
};