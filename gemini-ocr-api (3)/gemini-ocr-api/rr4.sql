--
-- PostgreSQL database dump
--

\restrict VpKfdLToajHVCz1vujLS9ZTNCjYynRk503iyANnwhEhYm0LDXejSjGZldC0RydT

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2025-11-20 21:40:02

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
-- TOC entry 220 (class 1259 OID 16390)
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
-- TOC entry 219 (class 1259 OID 16389)
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
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 219
-- Name: equipment_equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_equipment_id_seq OWNED BY public.equipment.equipment_id;


--
-- TOC entry 222 (class 1259 OID 16404)
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
-- TOC entry 221 (class 1259 OID 16403)
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
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 221
-- Name: equipment_part_part_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_part_part_id_seq OWNED BY public.equipment_part.part_id;


--
-- TOC entry 224 (class 1259 OID 16418)
-- Name: inspection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inspection (
    inspection_id bigint NOT NULL,
    equipment_id integer NOT NULL,
    inspected_at timestamp without time zone NOT NULL,
    inspected_by character varying(100) NOT NULL,
    check_type character varying(50),
    location character varying(100),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.inspection OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16417)
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
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 223
-- Name: inspection_inspection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inspection_inspection_id_seq OWNED BY public.inspection.inspection_id;


--
-- TOC entry 229 (class 1259 OID 16484)
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
-- TOC entry 228 (class 1259 OID 16483)
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
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 228
-- Name: inspection_methods_method_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inspection_methods_method_id_seq OWNED BY public.inspection_methods.method_id;


--
-- TOC entry 225 (class 1259 OID 16431)
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
-- TOC entry 227 (class 1259 OID 16442)
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
-- TOC entry 226 (class 1259 OID 16441)
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
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 226
-- Name: report_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.report_report_id_seq OWNED BY public.report.report_id;


--
-- TOC entry 231 (class 1259 OID 16501)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'user'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16500)
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
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 230
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4885 (class 2604 OID 16393)
-- Name: equipment equipment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment ALTER COLUMN equipment_id SET DEFAULT nextval('public.equipment_equipment_id_seq'::regclass);


--
-- TOC entry 4888 (class 2604 OID 16407)
-- Name: equipment_part part_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_part ALTER COLUMN part_id SET DEFAULT nextval('public.equipment_part_part_id_seq'::regclass);


--
-- TOC entry 4891 (class 2604 OID 16421)
-- Name: inspection inspection_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection ALTER COLUMN inspection_id SET DEFAULT nextval('public.inspection_inspection_id_seq'::regclass);


--
-- TOC entry 4895 (class 2604 OID 16487)
-- Name: inspection_methods method_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_methods ALTER COLUMN method_id SET DEFAULT nextval('public.inspection_methods_method_id_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 16445)
-- Name: report report_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report ALTER COLUMN report_id SET DEFAULT nextval('public.report_report_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 16504)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 5075 (class 0 OID 16390)
-- Dependencies: 220
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment (equipment_id, equipment_no, pmt_no, equipment_desc, is_active, created_at, image_url, design_code) FROM stdin;
2	V-002	MLK PMT 10102	Expansion Tank	t	2025-11-09 12:39:48	\N	\N
3	V-003	MLK PMT 10103	Condensate Vessel	t	2025-11-09 12:39:48	\N	\N
4	V-004	MLK PMT 10104	Hot Water System	t	2025-11-09 12:39:48	\N	\N
5	V-005	MLK PMT 10105	Absorber for Neutralization of Acid Gases	t	2025-11-09 12:39:48	\N	\N
6	V-006	MLK PMT 10106	Thermal Deaerator	t	2025-11-09 12:39:48	\N	\N
8	H-002	MLK PMT 10108	Gas Scrubber Cooler	t	2025-11-09 12:39:48	\N	\N
9	H-003	MLK PMT 10109	Cooling of Water on Irrigation of An Absorber	t	2025-11-09 12:39:48	\N	\N
10	H-004	MLK PMT 10110	Reflux Condensor of Drying Tower	t	2025-11-09 12:39:48	\N	\N
1	V-001	MLK PMT 10101	Air Receiver	t	2025-11-09 12:39:48	https://i.imgur.com/g1f6tst.png	ASME VIII DIV 1
7	H-001	MLK PMT 10107	Cooling of Steam- Gas Mix at The Exit of the Reactor	t	2025-11-09 12:39:48	/uploads/image-1763644377143-759814067.png	ASME VIII DIV 1
\.


--
-- TOC entry 5077 (class 0 OID 16404)
-- Dependencies: 222
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
-- TOC entry 5079 (class 0 OID 16418)
-- Dependencies: 224
-- Data for Name: inspection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inspection (inspection_id, equipment_id, inspected_at, inspected_by, check_type, location, notes, created_at) FROM stdin;
1	7	2025-11-17 18:35:10.175	N/A	\N	\N	\N	2025-11-17 18:35:10.175899
9	7	2025-11-18 02:15:31.545	N/A	\N	\N	\N	2025-11-18 02:15:31.547459
\.


--
-- TOC entry 5084 (class 0 OID 16484)
-- Dependencies: 229
-- Data for Name: inspection_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inspection_methods (method_id, inspection_id, method_name, coverage, damage_mechanism) FROM stdin;
1	9	UTTM (Correction Factor)	100% of TML Location	General Corrosion
2	9	Visual Inspection	External Visual Inspection (100% Coverage)	Atmospheric Corrosion
\.


--
-- TOC entry 5080 (class 0 OID 16431)
-- Dependencies: 225
-- Data for Name: inspection_part; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inspection_part (inspection_id, part_id, part_name, phase, fluid, type, spec, grade, insulation, design_temp, design_pressure, operating_temp, operating_pressure, condition_note, current_risk_rating, corrosion_group, design_code) FROM stdin;
1	19	Channel	Gas	STEAM	Carbon Steel	SA-516	70	100	160.00	0.50	150.00	0.40	{"ut_reading":null,"visual_finding":null}	\N	\N	\N
1	20	Shell	Gas	STEAM	Carbon Steel	SA-516	70	100	160.00	0.50	150.00	0.40	{"ut_reading":null,"visual_finding":null}	\N	\N	\N
1	21	Tube Bundle	Gas	STEAM	Alloy Steel	SA-213	T11	100	160.00	0.50	150.00	0.40	{"ut_reading":null,"visual_finding":null}	\N	\N	\N
9	19	Channel	Gas	Vent Gas	CS	SA-516	70L	100	500.00	0.50	150.00	0.40	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	\N
9	20	Shell	Gas	Vent Gas	CS	SA-516	70L	100	500.00	0.50	150.00	0.40	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	\N
9	21	Tube Bundle	Gas	Vent Gas	SS	SA-240	304	100	500.00	0.50	150.00	0.40	{"ut_reading":null,"visual_finding":null}	LOW	Internal Shell\nGeneral Corrosion\n\nExternal\nATMOSPHERIC CORROSION	\N
\.


--
-- TOC entry 5082 (class 0 OID 16442)
-- Dependencies: 227
-- Data for Name: report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.report (report_id, inspection_id, report_no, report_type, file_path, created_at) FROM stdin;
\.


--
-- TOC entry 5086 (class 0 OID 16501)
-- Dependencies: 231
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password, role, created_at) FROM stdin;
1	admin	admin123	admin	2025-11-20 21:31:51.888168
2	user	user123	user	2025-11-20 21:31:51.888168
\.


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 219
-- Name: equipment_equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_equipment_id_seq', 10, true);


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 221
-- Name: equipment_part_part_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_part_part_id_seq', 30, true);


--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 223
-- Name: inspection_inspection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inspection_inspection_id_seq', 9, true);


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 228
-- Name: inspection_methods_method_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inspection_methods_method_id_seq', 2, true);


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 226
-- Name: report_report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.report_report_id_seq', 1, false);


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 230
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 2, true);


--
-- TOC entry 4900 (class 2606 OID 16402)
-- Name: equipment equipment_equipment_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_equipment_no_key UNIQUE (equipment_no);


--
-- TOC entry 4904 (class 2606 OID 16416)
-- Name: equipment_part equipment_part_equipment_id_part_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_part
    ADD CONSTRAINT equipment_part_equipment_id_part_name_key UNIQUE (equipment_id, part_name);


--
-- TOC entry 4906 (class 2606 OID 16414)
-- Name: equipment_part equipment_part_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_part
    ADD CONSTRAINT equipment_part_pkey PRIMARY KEY (part_id);


--
-- TOC entry 4902 (class 2606 OID 16400)
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (equipment_id);


--
-- TOC entry 4916 (class 2606 OID 16494)
-- Name: inspection_methods inspection_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_methods
    ADD CONSTRAINT inspection_methods_pkey PRIMARY KEY (method_id);


--
-- TOC entry 4910 (class 2606 OID 16440)
-- Name: inspection_part inspection_part_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_part
    ADD CONSTRAINT inspection_part_pkey PRIMARY KEY (inspection_id, part_id);


--
-- TOC entry 4908 (class 2606 OID 16430)
-- Name: inspection inspection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection
    ADD CONSTRAINT inspection_pkey PRIMARY KEY (inspection_id);


--
-- TOC entry 4912 (class 2606 OID 16453)
-- Name: report report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_pkey PRIMARY KEY (report_id);


--
-- TOC entry 4914 (class 2606 OID 16455)
-- Name: report report_report_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_report_no_key UNIQUE (report_no);


--
-- TOC entry 4918 (class 2606 OID 16512)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4920 (class 2606 OID 16514)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4921 (class 2606 OID 16456)
-- Name: equipment_part fk_ep_equipment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_part
    ADD CONSTRAINT fk_ep_equipment FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id) ON UPDATE CASCADE;


--
-- TOC entry 4926 (class 2606 OID 16495)
-- Name: inspection_methods fk_im_inspection; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_methods
    ADD CONSTRAINT fk_im_inspection FOREIGN KEY (inspection_id) REFERENCES public.inspection(inspection_id) ON DELETE CASCADE;


--
-- TOC entry 4922 (class 2606 OID 16461)
-- Name: inspection fk_insp_equipment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection
    ADD CONSTRAINT fk_insp_equipment FOREIGN KEY (equipment_id) REFERENCES public.equipment(equipment_id) ON UPDATE CASCADE;


--
-- TOC entry 4923 (class 2606 OID 16466)
-- Name: inspection_part fk_insp_part_inspection; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_part
    ADD CONSTRAINT fk_insp_part_inspection FOREIGN KEY (inspection_id) REFERENCES public.inspection(inspection_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4924 (class 2606 OID 16471)
-- Name: inspection_part fk_insp_part_part; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspection_part
    ADD CONSTRAINT fk_insp_part_part FOREIGN KEY (part_id) REFERENCES public.equipment_part(part_id) ON UPDATE CASCADE;


--
-- TOC entry 4925 (class 2606 OID 16476)
-- Name: report fk_report_inspection; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT fk_report_inspection FOREIGN KEY (inspection_id) REFERENCES public.inspection(inspection_id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-11-20 21:40:03

--
-- PostgreSQL database dump complete
--

\unrestrict VpKfdLToajHVCz1vujLS9ZTNCjYynRk503iyANnwhEhYm0LDXejSjGZldC0RydT

