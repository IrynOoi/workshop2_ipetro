--
-- PostgreSQL database dump
--

\restrict NjxZmoM3U0T5oGy6BwLxxfla4seNCIHJmpxllUoqNbdNw1L3mI1LrWTRdkhjrmg

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-01-13 17:30:44

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 17654)
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    equipment_id integer NOT NULL,
    equipment_no character varying(50) NOT NULL,
    pmt_no character varying(50) NOT NULL,
    equipment_desc character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image_url character varying(1024),
    design_code character varying(100)
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 17664)
-- Name: equipment_equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_equipment_id_seq OWNER TO postgres;

--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 220
-- Name: equipment_equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_equipment_id_seq OWNED BY public.equipment.equipment_id;


--
-- TOC entry 221 (class 1259 OID 17665)
-- Name: equipment_part; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_part (
    part_id integer NOT NULL,
    equipment_id integer NOT NULL,
    part_name character varying(100) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.equipment_part OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17673)
-- Name: equipment_part_part_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_part_part_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_part_part_id_seq OWNER TO postgres;

--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 222
-- Name: equipment_part_part_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_part_part_id_seq OWNED BY public.equipment_part.part_id;


--
-- TOC entry 223 (class 1259 OID 17674)
-- Name: inspection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inspection (
    inspection_id bigint NOT NULL,
    equipment_id integer NOT NULL,
    inspector_id integer,
    inspected_at timestamp without time zone NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    inspector_signature text
);


ALTER TABLE public.inspection OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17683)
-- Name: inspection_inspection_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inspection_inspection_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspection_inspection_id_seq OWNER TO postgres;

--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 224
-- Name: inspection_inspection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inspection_inspection_id_seq OWNED BY public.inspection.inspection_id;


--
-- TOC entry 225 (class 1259 OID 17684)
-- Name: inspection_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inspection_methods (
    method_id integer NOT NULL,
    inspection_id bigint NOT NULL,
    method_name character varying(255) NOT NULL,
    coverage text,
    damage_mechanism character varying(255)
);


ALTER TABLE public.inspection_methods OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17692)
-- Name: inspection_methods_method_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inspection_methods_method_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspection_methods_method_id_seq OWNER TO postgres;

--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 226
-- Name: inspection_methods_method_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inspection_methods_method_id_seq OWNED BY public.inspection_methods.method_id;


--
-- TOC entry 227 (class 1259 OID 17693)
-- Name: inspection_part; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inspection_part (
    inspection_id bigint NOT NULL,
    part_id integer NOT NULL,
    part_name character varying(100) NOT NULL,
    phase character varying(50),
    fluid character varying(100),
    type character varying(100),
    spec character varying(100),
    grade character varying(100),
    insulation character varying(100),
    design_temp numeric(8,2),
    design_pressure numeric(8,2),
    operating_temp numeric(8,2),
    operating_pressure numeric(8,2),
    condition_note text,
    current_risk_rating character varying(50),
    corrosion_group text,
    design_code character varying(100)
);


ALTER TABLE public.inspection_part OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17701)
-- Name: report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report (
    report_id bigint NOT NULL,
    inspection_id bigint NOT NULL,
    report_no character varying(50) NOT NULL,
    report_type character varying(50),
    file_path character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.report OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17710)
-- Name: report_report_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.report_report_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.report_report_id_seq OWNER TO postgres;

--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 229
-- Name: report_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.report_report_id_seq OWNED BY public.report.report_id;


--
-- TOC entry 230 (class 1259 OID 17711)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    full_name character varying(100),
    profile_picture character varying(500),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('admin'::character varying)::text, ('user'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17722)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 231
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4885 (class 2604 OID 17723)
-- Name: equipment equipment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment ALTER COLUMN equipment_id SET DEFAULT nextval('public.equipment_equipment_id_seq'::regclass);


--
-- TOC entry 4888 (class 2604 OID 17724)
-- Name: equipment_part part_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_part ALTER COLUMN part_id SET DEFAULT nextval('public.equipment_part_part_id_seq'::regclass);


--
-- TOC entry 4891 (class 2604 OID 17725)
-- Name: inspection inspection_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection ALTER COLUMN inspection_id SET DEFAULT nextval('public.inspection_inspection_id_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 17726)
-- Name: inspection_methods method_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_methods ALTER COLUMN method_id SET DEFAULT nextval('public.inspection_methods_method_id_seq'::regclass);


--
-- TOC entry 4894 (class 2604 OID 17727)
-- Name: report report_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report ALTER COLUMN report_id SET DEFAULT nextval('public.report_report_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 17728)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 5075 (class 0 OID 17654)
-- Dependencies: 219
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment (equipment_id, equipment_no, pmt_no, equipment_desc, is_active, created_at, image_url, design_code) FROM stdin;
1	V-001	MLK PMT 10101	Air Receiver	t	2025-11-09 12:39:48	https://i.imgur.com/g1f6tst.png	ASME VIII DIV 1
2	V-002	MLK PMT 10102	Expansion Tank	t	2025-11-09 12:39:48	\N	ASME SEC. VIII DIV. 1 2010 EDITION
5	V-005	MLK PMT 10105	Absorber for Neutralization of Acid Gases	t	2025-11-09 12:39:48	\N	\N
9	H-003	MLK PMT 10109	Cooling of Water on Irrigation of An Absorber	t	2025-11-09 12:39:48	\N	\N
10	H-004	MLK PMT 10110	Reflux Condensor of Drying Tower	t	2025-11-09 12:39:48	\N	\N
8	H-002	MLK PMT 10108	Gas Scrubber Cooler	t	2025-11-09 12:39:48	/uploads/image-1766979111450-572954046.jpg	ASME SEC. VIII DIV. 1 2010 EDITION
7	H-001	MLK PMT 10107	Cooling of Steam- Gas Mix at The Exit of the Reactor	t	2025-11-09 12:39:48	/uploads/image-1763644377143-759814067.png	ASME VIII DIV 1
4	V-004	MLK PMT 10104	Hot Water System	t	2025-11-09 12:39:48	\N	ASME SEC VIII DIV.1
3	V-003	MLK PMT 10103	Condensate Vessel	t	2025-11-09 12:39:48	\N	ASME SEC.VIII DIV.1
6	V-006	MLK PMT 10106	Thermal Deaerator	t	2025-11-09 12:39:48	/uploads/image-1768294710821-679021466.jpg	ASME VIII DIV 1
\.


--
-- TOC entry 5077 (class 0 OID 17665)
-- Dependencies: 221
-- Data for Name: equipment_part; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment_part (part_id, equipment_id, part_name, is_active, created_at) FROM stdin;
1	1	Top Head	t	2025-11-09 12:40:00
2	1	Shell	t	2025-11-09 12:40:00
3	1	Bottom Head	t	2025-11-09 12:40:00
4	2	Top Head	t	2025-11-09 12:40:00
5	2	Shell	t	2025-11-09 12:40:00
6	2	Bottom Head	t	2025-11-09 12:40:00
7	3	Top Head	t	2025-11-09 12:40:00
8	3	Shell	t	2025-11-09 12:40:00
9	3	Bottom Head	t	2025-11-09 12:40:00
10	4	Head	t	2025-11-09 12:40:00
11	4	Shell	t	2025-11-09 12:40:00
13	5	Top Channel	t	2025-11-09 12:40:00
14	5	Shell	t	2025-11-09 12:40:00
15	5	Bottom Channel	t	2025-11-09 12:40:00
16	6	Head	t	2025-11-09 12:40:00
17	6	Shell	t	2025-11-09 12:40:00
19	7	Channel	t	2025-11-09 12:40:00
20	7	Shell	t	2025-11-09 12:40:00
21	7	Tube Bundle	t	2025-11-09 12:40:00
22	8	Channel	t	2025-11-09 12:40:00
23	8	Shell	t	2025-11-09 12:40:00
24	8	Tube Bundle	t	2025-11-09 12:40:00
25	9	Channel	t	2025-11-09 12:40:00
26	9	Shell	t	2025-11-09 12:40:00
27	9	Tube Bundle	t	2025-11-09 12:40:00
28	10	Channel	t	2025-11-09 12:40:00
29	10	Shell	t	2025-11-09 12:40:00
30	10	Tube Bundle	t	2025-11-09 12:40:00
\.


--
-- TOC entry 5079 (class 0 OID 17674)
-- Dependencies: 223
-- Data for Name: inspection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inspection (inspection_id, equipment_id, inspector_id, inspected_at, notes, created_at, inspector_signature) FROM stdin;
11	2	1	2025-11-21 03:14:37.114	\N	2025-11-21 03:14:37.116	\N
12	7	1	2025-12-04 16:42:03.308	\N	2025-12-04 16:42:03.308	\N
13	7	1	2025-12-07 15:39:53.036	\N	2025-12-07 15:39:53.037	\N
14	8	3	2025-12-28 23:03:04.486	\N	2025-12-28 23:03:04.484328	\N
15	7	3	2025-12-29 12:27:46.365	\N	2025-12-29 12:27:46.362333	\N
17	3	3	2026-01-03 15:15:21.911	\N	2026-01-03 15:15:21.91116	\N
18	4	1	2026-01-12 18:47:18.937	{"observations":"Very good","recommendations":"very good"}	2026-01-12 18:47:18.933447	data:image/png;base64,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
19	3	1	2026-01-13 16:49:52.8	{"observations":"","recommendations":""}	2026-01-13 16:49:52.79621	\N
16	7	1	2026-01-02 08:26:12.595	{"observations":"","recommendations":""}	2026-01-02 08:26:12.591971	data:image/png;base64,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
\.


--
-- TOC entry 5081 (class 0 OID 17684)
-- Dependencies: 225
-- Data for Name: inspection_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inspection_methods (method_id, inspection_id, method_name, coverage, damage_mechanism) FROM stdin;
5	11	UTTM (Correction Factor)	100% of TML Location	General Corrosion
6	11	Visual Inspection	External Visual Inspection (100% Coverage)	Atmospheric Corrosion
7	12	UTTM (Correction Factor)	100% of TML Location	General Corrosion
8	12	Visual Inspection	External Visual Inspection (100% Coverage)	Atmospheric Corrosion
9	13	UTTM (Correction Factor)	100% of TML Location	General Corrosion
10	13	Visual Inspection	External Visual Inspection (100% Coverage)	Atmospheric Corrosion
11	14	UTTM (Correction Factor)	100% of TML Location	General Corrosion
12	14	Visual Inspection	External Visual Inspection (100% Coverage)	Atmospheric Corrosion
13	15	UTTM (Correction Factor)	100% of TML Location	General Corrosion
14	15	Visual Inspection	External Visual Inspection (100% Coverage)	Atmospheric Corrosion
15	16	UTTM (Correction Factor)	100% of TML Location	General Corrosion
16	16	Visual Inspection	External Visual Inspection (100% Coverage)	Atmospheric Corrosion
17	17	UTTM (Correction Factor)	100% of TML Location	General Corrosion
18	17	Visual Inspection	External Visual Inspection (100% Coverage)	Atmospheric Corrosion
19	18	UTTM (Correction Factor)	100% of TML Location	General Corrosion
20	18	Visual Inspection	External Visual Inspection (100% Coverage)	Atmospheric Corrosion
21	19	UTTM (Correction Factor)	100% of TML Location	General Corrosion
22	19	Visual Inspection	External Visual Inspection (100% Coverage)	Atmospheric Corrosion
\.


--
-- TOC entry 5083 (class 0 OID 17693)
-- Dependencies: 227
-- Data for Name: inspection_part; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inspection_part (inspection_id, part_id, part_name, phase, fluid, type, spec, grade, insulation, design_temp, design_pressure, operating_temp, operating_pressure, condition_note, current_risk_rating, corrosion_group, design_code) FROM stdin;
11	4	Top Head	Liquid	WATER	CS	SA-516	70L	P.T.F.E LINED	60.00	1.00	50.00	0.80	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	\N
11	5	Shell	Liquid	WATER	CS	SA-516	70L	P.T.F.E LINED	60.00	1.00	50.00	0.80	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	\N
11	6	Bottom Head	Liquid	WATER	CS	SA-516	70L	P.T.F.E LINED	60.00	1.00	50.00	0.80	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	\N
12	19	Channel	Liquid	Cooling Water	CS	SA-516	70	None	2.00	2.00	2.00	0.55	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	\N
12	20	Shell	Liquid	Cooling Water	CS	SA-516	70	None	2.00	2.00	2.00	0.55	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	\N
12	21	Tube Bundle	Liquid	Cooling Water	SS	SA-249	TP304	None	2.00	2.00	2.00	0.55	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	\N
13	19	Channel	Gas	Vent Gas	CS	SA-516	70	NO	120.00	0.14	100.00	0.10	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	\N
13	20	Shell	Gas	Vent Gas	CS	SA-516	70	NO	120.00	0.14	100.00	0.10	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	\N
13	21	Tube Bundle	Gas	Vent Gas	SS	SA-240	304L	NO	120.00	0.14	100.00	0.10	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	\N
14	22	Channel	Gas	VENT GAS	CS	SA-516	70N	YES	400.00	1.00	350.00	0.80	{"ut_reading":null,"visual_finding":null}	MEDIUM HIGH	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	ASME VIII DIV.1 / TEMA R
14	23	Shell	Gas	VENT GAS	CS	SA-516	70N	YES	400.00	1.00	350.00	0.80	{"ut_reading":null,"visual_finding":null}	MEDIUM HIGH	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	ASME VIII DIV.1 / TEMA R
14	24	Tube Bundle	Gas	VENT GAS	\N	\N	\N	YES	400.00	1.00	350.00	0.80	{"ut_reading":null,"visual_finding":null}	MEDIUM HIGH	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	ASME VIII DIV.1 / TEMA R
15	19	Channel	Gas	VENT GAS	CS	SA-516	70N	ROCK WOOL	200.00	0.05	180.00	0.02	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	ASME VIII DIV 1
15	20	Shell	Gas	VENT GAS	CS	SA-516	70N	ROCK WOOL	200.00	0.05	180.00	0.02	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	ASME VIII DIV 1
15	21	Tube Bundle	Gas	VENT GAS	CS	SA-179	T22	ROCK WOOL	200.00	0.05	180.00	0.02	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	ASME VIII DIV 1
17	7	Top Head	Gas	Vent Gas	CS	SA-516	70L	Not Provided	100.00	1.00	50.00	0.08	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	ASME Sec. VIII, Div. I
17	8	Shell	Gas	Vent Gas	CS	SA-516	70L	Not Provided	100.00	1.00	50.00	0.08	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	ASME Sec. VIII, Div. I
17	9	Bottom Head	Gas	Vent Gas	CS	SA-516	70L	Not Provided	100.00	1.00	50.00	0.08	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	ASME Sec. VIII, Div. I
16	19	Channel	Fluid	Process Fluid	CS	SA-516	70N	N	200.00	2.00	180.00	1.60	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell General Corrosion External ATMOSPHERIC CORROSION	ASME VIII DIV 1
16	20	Shell	Fluid	Process Fluid	CS	SA-516	70N	N	200.00	2.00	180.00	1.60	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell General Corrosion External ATMOSPHERIC CORROSION	ASME VIII DIV 1
16	21	Tube Bundle	Fluid	Process Fluid	Alloy	SB-163	N08825	N	200.00	2.00	180.00	1.60	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell General Corrosion External ATMOSPHERIC CORROSION	ASME VIII DIV 1
19	9	Bottom Head	null	null	CS	SA-516	70	N	50.00	1.70	50.00	1.70	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell General Corrosion External ATMOSPHERIC CORROSION	ASME SEC.VIII DIV.1
19	8	Shell	null	null	CS	SA-516	70	N	50.00	1.70	50.00	1.70	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell General Corrosion External ATMOSPHERIC CORROSION	ASME SEC.VIII DIV.1
18	10	Head	Gas	Vent Gas	CS	SA-516	70L	N	150.00	0.10	50.00	0.00	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell General Corrosion External ATMOSPHERIC CORROSION	ASME SEC VIII DIV.1
19	7	Top Head	null	null	CS	SA-516	70	N	50.00	1.70	50.00	1.70	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell General Corrosion External ATMOSPHERIC CORROSION	ASME SEC.VIII DIV.1
18	11	Shell	Gas	Vent Gas	CS	SA-516	70L	N	150.00	0.10	50.00	0.00	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell General Corrosion External ATMOSPHERIC CORROSION	ASME SEC VIII DIV.1
\.


--
-- TOC entry 5084 (class 0 OID 17701)
-- Dependencies: 228
-- Data for Name: report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.report (report_id, inspection_id, report_no, report_type, file_path, created_at) FROM stdin;
\.


--
-- TOC entry 5086 (class 0 OID 17711)
-- Dependencies: 230
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password, role, created_at, full_name, profile_picture) FROM stdin;
2	raziqhadif	user123	user	2025-11-20 21:31:51.888	\N	/uploads/profiles/profile-1765092906429-110923510.png
3	IRYNOOI	123456	user	2025-12-28 18:10:05.933379	OOI XIEN XIEN	/uploads/profiles/profile-1767520898928-536808672.jpg
1	admin	admin123	admin	2025-11-20 21:31:51.888	OOI XIEN XIEN	/uploads/profiles/profile-1767520929823-803907104.png
4	oxx	123456	user	2026-01-13 16:59:50.311948	OOI XIEN XIEN	/uploads/profiles/profile-1768295039619-998230017.jpg
5	normal user	1234	user	2026-01-13 17:11:35.252563	\N	\N
\.


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 220
-- Name: equipment_equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_equipment_id_seq', 13, true);


--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 222
-- Name: equipment_part_part_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_part_part_id_seq', 31, true);


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 224
-- Name: inspection_inspection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inspection_inspection_id_seq', 19, true);


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 226
-- Name: inspection_methods_method_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inspection_methods_method_id_seq', 22, true);


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 229
-- Name: report_report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.report_report_id_seq', 1, false);


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 231
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 5, true);


--
-- TOC entry 4900 (class 2606 OID 17730)
-- Name: equipment equipment_equipment_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_equipment_no_key UNIQUE (equipment_no);


--
-- TOC entry 4904 (class 2606 OID 17732)
-- Name: equipment_part equipment_part_equipment_id_part_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_part
    ADD CONSTRAINT equipment_part_equipment_id_part_name_key UNIQUE (equipment_id, part_name);


--
-- TOC entry 4906 (class 2606 OID 17734)
-- Name: equipment_part equipment_part_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_part
    ADD CONSTRAINT equipment_part_pkey PRIMARY KEY (part_id);


--
-- TOC entry 4902 (class 2606 OID 17736)
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (equipment_id);


--
-- TOC entry 4910 (class 2606 OID 17738)
-- Name: inspection_methods inspection_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_methods
    ADD CONSTRAINT inspection_methods_pkey PRIMARY KEY (method_id);


--
-- TOC entry 4912 (class 2606 OID 17740)
-- Name: inspection_part inspection_part_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_part
    ADD CONSTRAINT inspection_part_pkey PRIMARY KEY (inspection_id, part_id);


--
-- TOC entry 4908 (class 2606 OID 17742)
-- Name: inspection inspection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection
    ADD CONSTRAINT inspection_pkey PRIMARY KEY (inspection_id);


--
-- TOC entry 4914 (class 2606 OID 17744)
-- Name: report report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_pkey PRIMARY KEY (report_id);


--
-- TOC entry 4916 (class 2606 OID 17746)
-- Name: report report_report_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_report_no_key UNIQUE (report_no);


--
-- TOC entry 4918 (class 2606 OID 17748)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4920 (class 2606 OID 17750)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4921 (class 2606 OID 17751)
-- Name: equipment_part fk_ep_equipment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_part
    ADD CONSTRAINT fk_ep_equipment FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id) ON UPDATE CASCADE;


--
-- TOC entry 4924 (class 2606 OID 17756)
-- Name: inspection_methods fk_im_inspection; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_methods
    ADD CONSTRAINT fk_im_inspection FOREIGN KEY (inspection_id) REFERENCES public.inspection(inspection_id) ON DELETE CASCADE;


--
-- TOC entry 4922 (class 2606 OID 17761)
-- Name: inspection fk_insp_equipment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection
    ADD CONSTRAINT fk_insp_equipment FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id) ON UPDATE CASCADE;


--
-- TOC entry 4925 (class 2606 OID 17766)
-- Name: inspection_part fk_insp_part_inspection; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_part
    ADD CONSTRAINT fk_insp_part_inspection FOREIGN KEY (inspection_id) REFERENCES public.inspection(inspection_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4926 (class 2606 OID 17771)
-- Name: inspection_part fk_insp_part_part; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_part
    ADD CONSTRAINT fk_insp_part_part FOREIGN KEY (part_id) REFERENCES public.equipment_part(part_id) ON UPDATE CASCADE;


--
-- TOC entry 4923 (class 2606 OID 17776)
-- Name: inspection fk_insp_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection
    ADD CONSTRAINT fk_insp_users FOREIGN KEY (inspector_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 4927 (class 2606 OID 17781)
-- Name: report fk_report_inspection; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT fk_report_inspection FOREIGN KEY (inspection_id) REFERENCES public.inspection(inspection_id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-01-13 17:30:45

--
-- PostgreSQL database dump complete
--

\unrestrict NjxZmoM3U0T5oGy6BwLxxfla4seNCIHJmpxllUoqNbdNw1L3mI1LrWTRdkhjrmg

