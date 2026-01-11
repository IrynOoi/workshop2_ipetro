const db = require('../config/db');
const path = require('path');
const dotenv = require('dotenv');

// --- SECURE API KEY LOADING ---
// 1. Try default location (root of where node runs)
dotenv.config();

// 2. Try specific path mentioned by user (Grandparent folder relative to this controller)
if (!process.env.GEMINI_API_KEY) {
    const parentEnvPath = path.resolve(__dirname, '../../.env');
    dotenv.config({ path: parentEnvPath });
}

// Ensure node-fetch is available
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/**
 * Dashboard Controller
 * Handles analytics and statistical calculations for the system dashboard
 */

/**
 * Get aggregated dashboard statistics
 * @route GET /api/dashboard/stats
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Basic Counts
        const totalEquipmentQuery = await db.query('SELECT COUNT(*) FROM equipment WHERE is_active = true');
        const totalInspectionsQuery = await db.query('SELECT COUNT(*) FROM inspection');
        
        // 2. Risk Distribution (Equipment Level Calculation)
        const riskDistributionQuery = await db.query(`
            WITH LatestInspections AS (
                SELECT DISTINCT ON (equipment_id) 
                    inspection_id,
                    equipment_id
                FROM inspection 
                ORDER BY equipment_id, inspected_at DESC
            ),
            EquipmentRiskScores AS (
                SELECT 
                    li.equipment_id,
                    MAX(
                        CASE 
                            WHEN ip.current_risk_rating = 'HIGH' THEN 4
                            WHEN ip.current_risk_rating = 'MEDIUM HIGH' THEN 3
                            WHEN ip.current_risk_rating = 'MEDIUM' THEN 2
                            WHEN ip.current_risk_rating = 'LOW' THEN 1
                            ELSE 0 
                        END
                    ) as max_score
                FROM LatestInspections li
                JOIN inspection_part ip ON li.inspection_id = ip.inspection_id
                GROUP BY li.equipment_id
            )
            SELECT 
                CASE 
                    WHEN max_score = 4 THEN 'HIGH'
                    WHEN max_score = 3 THEN 'MEDIUM HIGH'
                    WHEN max_score = 2 THEN 'MEDIUM'
                    WHEN max_score = 1 THEN 'LOW'
                    ELSE 'Unrated'
                END as rating, 
                COUNT(*) as count 
            FROM EquipmentRiskScores 
            GROUP BY max_score
            ORDER BY max_score DESC
        `);

        // 3. High Risk Alerts (Calculation)
        const highRiskAlertsQuery = await db.query(`
            WITH LatestInspections AS (
                SELECT DISTINCT ON (equipment_id) 
                    inspection_id
                FROM inspection 
                ORDER BY equipment_id, inspected_at DESC
            )
            SELECT COUNT(DISTINCT ip.inspection_id) 
            FROM inspection_part ip
            INNER JOIN LatestInspections li ON ip.inspection_id = li.inspection_id
            WHERE ip.current_risk_rating IN ('HIGH', 'MEDIUM HIGH')
        `);

        // 4. Inspection Trend (Last 6 Months)
        const inspectionTrendQuery = await db.query(`
            SELECT 
                TO_CHAR(inspected_at, 'Mon YYYY') as month,
                DATE_TRUNC('month', inspected_at) as date_sort,
                COUNT(*) as count
            FROM inspection
            WHERE inspected_at >= NOW() - INTERVAL '6 months'
            GROUP BY 1, 2
            ORDER BY 2 ASC
        `);

        // 5. Recent Critical Findings (Parts causing high risk)
        const criticalFindingsQuery = await db.query(`
            WITH LatestInspections AS (
                SELECT DISTINCT ON (equipment_id) 
                    inspection_id
                FROM inspection 
                ORDER BY equipment_id, inspected_at DESC
            )
            SELECT 
                e.equipment_no,
                ip.part_name,
                ip.current_risk_rating,
                i.inspected_at
            FROM inspection_part ip
            JOIN inspection i ON ip.inspection_id = i.inspection_id
            JOIN LatestInspections li ON i.inspection_id = li.inspection_id
            JOIN equipment e ON i.equipment_id = e.equipment_id
            WHERE ip.current_risk_rating IN ('HIGH', 'MEDIUM HIGH')
            ORDER BY i.inspected_at DESC
            LIMIT 5
        `);

        // Process Risk Data for Chart.js
        const riskData = {
            labels: [],
            data: []
        };
        
        riskDistributionQuery.rows.forEach(row => {
            riskData.labels.push(row.rating);
            riskData.data.push(parseInt(row.count));
        });

        res.json({
            success: true,
            data: {
                counts: {
                    equipment: parseInt(totalEquipmentQuery.rows[0].count),
                    inspections: parseInt(totalInspectionsQuery.rows[0].count),
                    high_risk: parseInt(highRiskAlertsQuery.rows[0].count)
                },
                risk_dist: riskData,
                trends: inspectionTrendQuery.rows,
                critical_items: criticalFindingsQuery.rows
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};

/**
 * Get aggregated Masterfile data (Latest inspection per equipment)
 * @route GET /api/dashboard/export-master
 */
exports.exportMasterData = async (req, res) => {
    try {
        const query = `
            WITH LatestInspections AS (
                SELECT DISTINCT ON (equipment_id) 
                    inspection_id, 
                    equipment_id, 
                    inspected_at 
                FROM inspection 
                ORDER BY equipment_id, inspected_at DESC
            )
            SELECT 
                e.equipment_id,
                e.equipment_no, 
                e.pmt_no, 
                e.equipment_desc, 
                ep.part_name, 
                ip.phase, 
                ip.fluid, 
                ip.type, 
                ip.spec, 
                ip.grade, 
                ip.insulation, 
                ip.design_temp, 
                ip.design_pressure, 
                ip.operating_temp, 
                ip.operating_pressure,
                ip.design_code,
                COALESCE(ip.current_risk_rating, 'Not Inspected') as current_risk_rating, 
                li.inspected_at         
            FROM equipment e
            JOIN equipment_part ep ON e.equipment_id = ep.equipment_id
            LEFT JOIN LatestInspections li ON e.equipment_id = li.equipment_id
            LEFT JOIN inspection_part ip ON ep.part_id = ip.part_id AND li.inspection_id = ip.inspection_id
            ORDER BY e.equipment_no ASC, ep.part_name ASC
        `;
        
        const { rows } = await db.query(query);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Master Export Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch master data',
            error: error.message
        });
    }
};