import fs from 'fs';

const rawData = `SP_IMP36	 IICC Dwarka - Firewall System-230051	Released	Larsen & Toubro Limited (Delhi)
DC_CON40	 Services for ReilTel Solar Structure-SC	Released	RailTel Corporation of India Ltd.(Hyd)
SI_SUP136	"CHEIFNET HO location SD-WAN DEIVCE	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC6	1 year SOC BIOLOGICAL E	Released	BIOLOGICAL E. LIMITED
CPSO86	230042	Released	Mak Controls and Systems Pvt Ltd
SI_SUP1	230043	Released	C P AQUACULTURE (INDIA) PRIVATE LIMITED
CPSO44	230045	Released	C P F (INDIA) PRIVATE LIMITED (AP)
SI_SUP3	230047	Released	C P F (INDIA) PRIVATE LIMITED (AP)
SI_SUP4	230082	Released	Larsen & Toubro Limited (Maharashtra)
EA_IMP2	230121 - BIAL IOT Bells and Veils	Released	Bangalore International Airport Limited
CPSO103	230131	Released	Center for Brain Research
SI_IMP16	230143	Released	Larsen & Toubro Limited (Telangana)
SI_IMP17	230148 -  SONICWALL Firewall_HCS	Released	Larsen & Toubro Limited (Telangana)
SI_IMP34	230172 - Space Telelink - Implementation	Released	SPACE TELELINK LIMITED
SI_IMP18	230175 - Autocratic- FG600E	Released	Autocratic Technology Private Limited
SI_SUP29	230188 - L&T_Supply of FG 100F	Released	Larsen & Toubro Limited (Tamilnadu)
SI_IMP19	230264 - Zimbra license config_MSC	Released	Larsen & Toubro Limited (Uttar Pradesh)
SI_SUP36	230291 - AEH - Supply (HP208)-4 Nos	Released	GOVEL TRUST Aravind Eye Hospitals,
SI_IMP10	230317 - IIMK Wty Onsite Support	Released	Indian Institute of Management (Kozhikode)
SI_SUP62	230354 - Supply of Fortinet FW 60F	Released	C P F (INDIA) PRIVATE LIMITED (AP)
SI_IMP13	230358 - VLink SipCOT	Released	V Link Systems (P) Ltd
SI_SUP61	230362	Released	SPACE TELELINK LIMITED
SI_SUP60	230366 - Adobe Acrobat Std DC for teams	Released	SPACE WORLD GROUP LLP
SI_O-M11	230442 - Vizag Smt Cty_Firewall Renewal	Released	Larsen & Toubro Limited (Andhra Pradesh)
CPSO362	230471	Released	Center for Brain Research
SI_IMP35	230478 - Ranext_Implementation_100F	Released	RANEXT TECHNOLOGIES PRIVATE LIMITED
SI_AMC25	230531-Cethar Email Hosting	Released	CETHAR ENERGY LIMITED
SI_AMC26	230532-Cethar Email Hosting	Released	CETHAR ENERGY LIMITED
SI_SUP57	230545 - K7 Server supply	Released	K7 Computing Private Limited
SI_AMC29	230559-Rossi Fortinet Firewall Renewal	Released	Rossi Gearmotors (India) Pvt Ltd
SI_AMC30	230560-Rossi ILL	Released	Rossi Gearmotors (India) Pvt Ltd
SI_AMC31	230561 - Siemens Energy Server AMC	Released	SIEMENS ENERGY INDUSTRIAL TURBOMACHINERY INDIA PRIVATE LIMIT
SI_O-M13	230575-Flowserve Splicing	Released	Flowserve India Controls Pvt Ltd
SI_O-M14	230593 - Flowserve Man power	Released	Flowserve India Controls Pvt Ltd
SI_SUP66	230595 - KIOT supply	Released	Knowledge Institute of Technology Trust
SI_AMC33	230602-Gajananda Webhosting	Released	Gajaananda Jewellery Mart India P Ltd
MS_SUP25	230611	Released	VOICE SNAP SERVICES PVT LTD
SI_SUP67	230631 VLink SFP Module supply	Released	V Link Systems (P) Ltd
SI_O-M27	230633 - O_M Support & License renewal	Released	Bangalore International Airport Limited
CL_NEW_SUB4	230636 - ReadyLink BulkMail Qty.25000	Released	Readylink Internet Services Limited
SI_O-M15	230637-Flowserve Avaya work	Released	Flowserve India Controls Pvt Ltd
SI_SUP68	230643 - Elgi ACP IP Phone	Released	Elgi Equipment Limited
SI_IMP49	230653 - Rel Jio_A10 Deployment_Mumbai	Released	RELIANCE PROJECTS & PROPERTY MANAGEMENT SERVICES LIMITED
SI_SUP69	230655 - Malnad HDD Supply	Released	Malnad College of Engineering
SI_AMC41	230666 - Malnad College of Engineerin	Released	Malnad College of Engineering
SI_IMP45	230670-KELTRON	Released	Kerala State Electronics Development Corporation Ltd
SI_AMC36	230673-Elgi ACP AMC	Released	Elgi Equipment Limited
SI_SUP73	230682-ZF Projector supply	Released	ZF Wind Power Coimbatore Ltd
SI_AMC37	230685-Dimexion Firewall Renewal	Released	Dimexon Diamonds Ltd
SI_AMC40	230699-LCC AMC	Released	Lakshmi Card Clothing Mfg Company
SI_IMP47	230719-Rossi Gears Passive	Released	Rossi Gearmotors (India) Pvt Ltd
SI_AMC38	230725- MRPL Support	Released	Mangalore Refinery and PetrochemicalsLtd
SI_AMC39	230727-Olam Extreme AMC	Released	Olam Information Services Private Ltd
SI_AMC42	230745-US TECHNOLOGY INTL. PVT. LTD	Released	US TECHNOLOGY INTL. PVT. LTD
SI_SUP77	230746-Flowserve Cable supply	Released	Flowserve India Controls Pvt Ltd
SI_IMP50	230754-KUDS AI order	Released	KERALA UNIVERSITY OF DIGITAL SCIENCES, INNOVATION AND TECHNO
SI_CON3	230759-ZF Cisco Zoro Inspection	Released	ZF Wind Power Coimbatore Ltd
SI_IMP54	230785-Tanfinet-Sterlite	Released	Sterlite Technologies Limited
SI_IMP52	230788-Dormakaba Passive work	Released	DORMAKABA INDIA PRIVATE LIMITED
SI_IMP53	230803-Olam Switches & AP Imp	Released	Olam Information Services Private Ltd
SI_AMC43	230811-Aditi Tech	Released	Aditi Tech Consulting Private Limited
SP_O-M3	230819 - T-Fiber O&M (Onsite support)	Released	Larsen & Toubro Limited (Telangana)
SI_SUP81	230825-Olam Patch cord supply	Released	Olam Information Services Private Ltd
SI_IMP60	230839-Catalist360	Released	Catalist360
SI_AMC45	230851-GKB vision	Released	GKB VISION PVT LTD
SI_AMC46	230907 - Citrix	Released	Citrix R & D India P Ltd
SI_CON5	230915-Flowserve OTC	Released	Flowserve India Controls Pvt Ltd
SI_SUP85	230920- VLink SFP Module supply	Released	V Link Systems (P) Ltd
SI_AMC47	230927 - Siemens	Released	SIEMENS ENERGY INDUSTRIAL TURBOMACHINERY INDIA PRIVATE LIMIT
SI_CON6	230935-SSMET	Released	SSM Instuite of Engineering & Technology
SI_IMP65	230938-BEL Backup solution	Released	BHARAT ELECTRONICS LTD
SI_AMC48	230945 - Aditi Tech	Released	Aditi Tech Consulting Private Limited
SI_SUP93	230955- VLink Module supply	Released	V Link Systems (P) Ltd
SI_IMP75	230963	Released	QUALITY CARE HOSPITAL INDIA LTD Vizag-1
SI_IMP74	230968	Released	RAMKRISHNA CARE MEDICAL SCIENCES PRIVATE LIMITED
SI_AMC49	230970-Elgi Motor Plant AMC	Released	Elgi Equipment Limited
SI_IMP67	230975-SRS IIT Palakkad UPS Supply	Released	Sukhdev Raj Sharma Engineers & Contractors Pvt Ltd
SI_SUP96	240015-Amrita Kollam Palo Alto	Released	Amrita Vishwa Vidyapeetham(KL)
SI_SUP97	240018-Jos Alukkas Thin Client	Released	Alukkas Enterprises Private Limited
SI_CON7	240020 - Rathinam consultancy	Released	K.Palaniyappa Memorial Educational Trust
SI_SUP99	240022-ZF Passive material supply	Released	ZF Wind Power Coimbatore Ltd
SI_SUP98	240029-Vlink SFP module supply	Released	V Link Systems (P) Ltd
SI_AMC50	240030- Citrix R & D India Pvt. Ltd	Released	Citrix R & D India P Ltd
SI_IMP83	240032-Dimexon OTC	Released	DIMEXON INTEGRATED BUSINESS SERV PVT LTD Mumbai
SI_AMC51	240035-MNEC CONSULTANTS PRIVATE LIMITED	Released	MNEC CONSULTANTS PRIVATE LIMITED
SI_AMC52	240042 - Defense Services Staff College	Released	DEFENCE SERVICES STAFF COLLEGE
EA_IMP9	240047-ENES Tex	Released	M/S. ENES TEXTILE MILLS
SI_AMC53	240049-SecOnCloud IT Services-BIOCON	Released	SecOnCloud IT Services Pvt. Ltd
SI_O-M23	240053 - Bangalore International Airport	Released	Bangalore International Airport Limited
SI_IMP87	240054-Govt Adi Firewall	Released	Govt. Adi dravidar Welfare Higher Secondary school
SI_IMP85	240056- Rabwin Switch	Released	RABWIN INDUSTRIES PVT LTD
SI_IMP82	240057 - MCET-Passive IMP	Released	Dr. Mahalingam College of Engineering and Technology
SI_IMP86	240059-Rossi Gears CCTV & VC Imp	Released	Rossi Gearmotors (India) Pvt Ltd
SI_O-M24	240060-AIIMS GORAKHPUR	Released	Larsen & Toubro Limited (Uttar Pradesh)
SI_O-M25	240071- BGPPL - O&M	Released	BILT GRAPHIC PAPER PRODUCTS LIMITED- HARYANA
SI_IMP89	240078-KSEB Firewall Installation	Released	Kerala State Electricity Board Limited
SI_AMC56	240079 - Royal Sundaram general ins. Ltd	Released	Royal Sundaram General Insurance Co. Limited
SI_AMC59	240095- K.Palaniyappa Memorial Trust	Released	K.Palaniyappa Memorial Educational Trust
SI_AMC57	240103-TAMILNADU INVESTMENT CORPORATION	Released	THE TAMILNADU INVESTMENT CORPORATION LTD
SI_IMP94	240112 - BIAL - PM_WANI & Router	Released	Bangalore International Airport Limited
SI_AMC60	240115-BIAL, CISCO EA SUBSCRIPTION SNT	Released	Bangalore International Airport Limited
SI_IMP92	240119-MCET Active order	Released	Dr. Mahalingam College of Engineering and Technology
SI_AMC61	240122_Royal Sundaram General Insurance	Released	Royal Sundaram General Insurance Co. Limited
SI_AMC62	240129-NINESTAR MOTORCYCLES-PALO ALTO	Released	NINESTAR MOTORCYCLES (BANGALORE) PRIVATE LIMITED
SI_IMP96	240133-MCET Netgear order	Released	Dr. Mahalingam College of Engineering and Technology
SI_AMC63	240139 - Readylink Internet Services	Released	Readylink Internet Services Limited
SI_SUP103	240144-Elgi IP Phone supply	Released	Elgi Equipment Limited
SI_SUP104	240147 - Vlink Module supply	Released	V Link Systems (P) Ltd
SI_AMC66	240151 - AMC of Switches & Routers	Released	Lakshmi Card Clothing Mfg Company
SI_IMP98	240163 - BH_COPC wifi & Passive comp	Released	Quality care India Limited-Telangana
SI_IMP99	240164 - BBSR_Active & Passive comp_SITC	Released	Quality Care India Limited- Orissa
SI_IMP100	240169 - Indore_Active comp (AP)_SITC	Released	Convenient Hospitals Ltd
SP_SUP8	240172 - Supply of Redhat_Linux_APSFL	Released	Larsen & Toubro Limited (Andhra Pradesh)
SI_IMP101	240175-Artika cotton Mills	Released	ARTIKA COTTON MILLS (A UNIT OF ENES TEXTILE MILLS)
SI_IMP102	240177-Rabwin DHCP & AD	Released	RABWIN INDUSTRIES PVT LTD
SI_IMP103	240181-GKNM WiFi order	Released	THE KUPPUSWAMY NAIDU CHARITY TRUST FOR EDUCATION AND MEDICAL
SI_SUP108	240189 - BIT Sathy Firewall supply	Released	BANNARIAMMAN EDUCATIONAL TRUST
SI_SUP109	240191 - VLink - Module supply	Released	V Link Systems (P) Ltd
SI_IMP113	240212- IT	Released	Netcon Technologies Private Limited
SI_SUP110	240217 - Visteon - Cisco AP supply	Released	VISTEON ELECTRONICS INDIA PRIVATE LTD
SI_SUP112	240218 - Supply of FortiGate switches	Released	Larsen & Toubro Limited (Andhra Pradesh)
SI_SUP111	240220_Supply_Fortigate POE switch	Released	Larsen & Toubro Limited (Andhra Pradesh)
FIELD_IMP3	240223_ITMS_Chennai_Field_IMP3	Released	L&T Technology Services Limited
SI_PROF_SER7	240231- Rossi Gears	Released	Rossi Gearmotors (India) Pvt Ltd
SI_AMC68	240238 - Rossi Gears Firewall Renewal	Released	Rossi Gearmotors (India) Pvt Ltd
SI_SUP113	240298 - MAK Controls supply	Released	Mak Controls and Systems Pvt Ltd
SI_IMP105	240302-MCET Switch & Module addl qty	Released	Dr. Mahalingam College of Engineering and Technology
SI_IMP106	240329-GKNM IPPBX Supply Installation	Released	THE KUPPUSWAMY NAIDU CHARITY TRUST FOR EDUCATION AND MEDICAL
DC_AMC7	240345 CAMC of Non IT DR Infra	Released	Regional Cancer Centre
SI_SUP121	240349 - MAPAL - Supply of Patch cords	Released	MAPAL India Private Limited
SI_SUP120	240354	Released	Royal Sundaram General Insurance Co. Limited
SI_SUP117	240364 - SentinelOne Endpoint Solution	Released	McFadyen Consulting Software India (P) Ltd
SI_O-M29	240390 L2 Onsite Support	Released	Elgi Equipment Limited
SI_O-M30	240397 NMDC O&M	Released	NMDC Ltd-(Hyderabad)
SI_AMC70	240398	Released	Royal Sundaram General Insurance Co. Limited
SI_IMP109	240405 - SITC Palo Alto FW -3nos	Released	McFadyen Consulting Software India (P) Ltd
FIELD_IMP4	240411	Released	Larsen & Toubro Limited (Telangana)
SI_PROF_SER10	240421 - Fortinet FW Subs. Renewal	Released	Dimexon Diamonds Ltd
CPSO625	240428 - Rapid 7 Subsc. Renewal	Released	BIOLOGICAL E. LIMITED
SI_AMC72	240430 - AMC of Cisco Switches & Routers	Released	Lakshmi Card Clothing Mfg Company
SI_SUP124	240441_Visteon_Supply of Cisco 9200 48P	Released	VISTEON ELECTRONICS INDIA PRIVATE LTD
SI_IMP114	240443 - Malnad College Firewall Upgrade	Released	Malnad College of Engineering
SI_IMP115	240447 - Rossi Gears Passive work	Released	Rossi Gearmotors (India) Pvt Ltd
SI_O-M31	240448 - ARC Support for 2 years	Released	PETRONET LNG LIMITED
CL_SUP27	240451- Cloud PAM	Released	McFadyen Consulting Software India (P) Ltd
SI_IMP117	240462-SSN-SITC-Smart Rack Commissioning	Released	SHIV NADAR UNIVERSITY
SI_AMC73	240466-CAMC for CISCO CORE SWITCH	Released	G.Kuppuswamy Naidu Memorial Hospital
CPSO632	240471	Released	Gajaananda Jewellery Mart India P Ltd
SI_SUP125	240478-CHIEFNET SECURE SDWAN NETWORK	Released	GAJAANANDA JEWELLERY MAART INDIA PVT LTD - HYDERABAD
SI_SUP126	240479-CHIEFNET SECURE SDWAN NETWORK	Released	Gajaananda Jewellery Mart India P Ltd
SI_SUP127	240481-CHIEFNET SECURE SDWAN NETWORK	Released	Gajaananda Jewellery Mart India P Ltd
SI_SUP128	240483-CHIEFNET SECURE SDWAN NETWORK	Released	Gajaananda Jewellery Mart India P Ltd
SI_SUP129	240486-CHIEFNET SECURE SDWAN NETWORK	Released	Gajaananda Jewellery Mart India P Ltd
SI_SUP130	240487-CHIEFNET SECURE SDWAN NETWORK	Released	Gajaananda Jewellery Mart India P Ltd
SI_SUP131	240488-CHIEFNET SECURE SDWAN NETWORK	Released	Gajaananda Jewellery Mart India P Ltd
SI_SUP132	240490-CHIEFNET SECURE SDWAN NETWORK	Released	Gajaananda Jewellery Mart India P Ltd
SI_SUP133	240492 - CHIFNET	Released	Gajaananda Jewellery Mart India P Ltd
CPSO643	240494	Released	Mak Controls and Systems Pvt Ltd
SI_AMC74	240496 - AMC of Dell Server	Released	CD Technotex LLP
DC_AMC9	240498 - 4th yr AMC of DC & DR (Non IT)	Released	Wipro GE Healthcare Private Limited
SI_SUP134	240499 - Wipro GE (SRH)	Released	Wipro GE Healthcare Private Limited
SI_IMP119	240504-malnad-Cisco switches & Rucker AP	Released	Malnad College of Engineering
SI_SUP135	240508 - Wireline - Arista Switch supply	Released	WIRELINE SOLUTION INDIA PVT LTD
SI_IMP118	240514-AIIMS , Delhi	Released	All India Institute of Medical Sciences (AIIMS)
SI_AMC75	240532 - Trendmicro License Renewal	Released	TVM Signalling and Transportation Systems Pvt Ltd
SP_AMC12	240534-Service Renewal_A10 Load Balancer	Released	Larsen & Toubro Limited (Telangana)
MS_CLOUD9	240540	Released	TRIVITRON HEALTH CARE
SI_PROF_SER12	240542 - Webserver Hosting	Released	Gajaananda Jewellery Mart India P Ltd
SI_SUP138	240544 - CHIEFNET SD-WAN DEVICE CHARGES	Released	Gajaananda Jewellery Mart India P Ltd
SI_IMP125	240562 -Rabwin CCTV	Released	RABWIN INDUSTRIES PVT LTD
SI_SUP140	240577 - Rathnam College	Released	K.Palaniyappa Memorial Educational Trust
SI_SUP139	240585-Elgi WiFi AP Order	Released	Elgi Equipment Limited
SI_IMP129	240586	Released	Amnex Infotechnologies Private Limited
SI_SUP142	240600 - NPST -  NGFW Supply	Released	NATIONAL PENSION SYSTEM TRUST
SI_SUP141	240604 -MCE additional switch supply	Released	Malnad College of Engineering
SI_SUP143	240620 - Manipal Hospital Jayanagar	Released	Manipal Health Enterprises Pvt Ltd.
SI_SUP144	240621-Manipal hospital Malleshwaram	Released	Manipal Health Enterprises Pvt Ltd.
SI_SUP145	240623 -Manipal Hospital  Mysore	Released	MANIPAL HOSPITALS PRIVATE LIMITED
SI_SUP146	240625-Manipal Hospital Shanthinikethan	Released	Manipal Health Enterprises Pvt Ltd
SP_PROF_SER5	240651 HPC Reconfiguration	Released	Central Marine Fisheries Research Inst.
SI_SUP147	240655 - DSSC Switch supply	Released	DEFENCE SERVICES STAFF COLLEGE
SI_IMP131	240656 - RIL - A10 device Installation	Released	Reliance Industries Limited
DC_CON33	240662 - Cisco Advance Services.	Released	Larsen & Toubro Limited (Telangana)
SI_IMP135	240667 - KSR College Firewall	Released	K S Rangasamy College of Technology (Autonomous)
SI_IMP134	240672-BSES	Released	BSES Yamuna Power Limited
SI_IMP137	240679 - SRS - NIT Surathkal	Released	Sukhdevraj Sharma Engineers & Contractors Pvt Ltd.
SI_O-M32	240680 - O&M ITPL 1 year	Released	India Trimmings Pvt Ltd
SI_SUP149	240683 - Solugenix Sonic FW supply	Released	Solugenix India Private Limited
SI_IMP136	240687 -  Elgi Core Switch order	Released	Elgi Equipment Limited
SI_SUP150	240691 - Pallava Group Switch Supply	Released	PALLAVA TEXTILES (P) LIMITED (Sri Cheran - Unit S1)
CPSO701	250002 - Radware WAF Renewal	Released	Siemens Technology and Services Pvt Ltd.
SI_AMC78	250006 - AMC of HP Server Infra	Released	Siemens Limited (Maharashtra)
SI_AMC79	250009 - AMC of Infra Devices	Released	Siemens Limited (Maharashtra)
SI_SUP151	250012 - Mak Control CCTV Supply	Released	Mak Controls and Systems Pvt Ltd
SI_SUP157	250014	Released	Manipal Health Enterprises Pvt. Ltd.
SI_SUP153	250021	Released	AMRI Hospitals Ltd - East Office
SI_SUP155	250023 - AMRI - WI-Fi_Execution(AP9166)	Released	AMRI Hospitals Ltd - East Office
SI_AMC81	250024-AMC IBM servers & Hitachi Storage	Released	Siemens Energy Industrial Turbomachinery India Pvt. Ltd
SI_AMC84	250025 - HP Server AMC 2No 3Y	Released	Siemens Limited (Maharashtra)
SI_AMC80	250026 - AMC OF SAN Switches	Released	US TECHNOLOGY INTL. PVT. LTD
SI_IMP140	250028 - Pallava grp One time impl	Released	PALLAVA TEXTILES (P) LIMITED (Sri Cheran - Unit S1)
MS_SEC10	250029 - Chiefnet support renewal erode	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC11	250030 - Chiefnet support renewal CBE	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC12	250031 - Chiefnet support renewal NMKL	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC13	250032 - Chiefnet Support Renewal MDU	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC15	250033 - Chiefnet support renewal - Slm	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC16	250034 - Chiefnet support renewal Rjplym	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC14	250035 - Chiefnet support renewal Hyd	Released	GAJAANANDA JEWELLERY MAART INDIA PVT LTD - HYDERABAD
MS_SEC17	250036 Chiefnet Support Renewal vrdchlm	Released	Gajaananda Jewellery Mart India P Ltd
SI_PROF_SER14	250037 - Extreme Premier support renewal	Released	Dr K M Cherian Institute of Medical Sciences Private Limited
SI_SUP154	250042 - Hirotec Coimbatore	Released	Hirotec India Private Limited
SI_SUP166	250043 - Siemens	Released	Siemens EDA (India) Private Limited
SI_AMC82	250046 - AMC of IBM server & Storage	Released	SIEMENS ENERGY INDUSTRIAL TURBOMACHINERY INDIA PRIVATE LIMIT
SI_SUP161	250051	Released	Manipal Health Enterprises Pvt. Ltd.
SI_SUP164	250052	Released	Manipal Health Enterprises Pvt Ltd.
SI_SUP159	250054	Released	Manipal Hospital Dwarka Pvt. Ltd
SI_SUP162	250055	Released	Manipal Health Enterprises Pvt Ltd.
SI_SUP165	250056	Released	Manipal Health Enterprises Pvt. Ltd.
SI_SUP163	250057	Released	MANIPAL HOSPITALS PRIVATE LIMITED
SI_SUP160	250058	Released	Manipal Hospital Dwarka Pvt. Ltd
SI_SUP158	250059	Released	Manipal Health Enterprises Pvt Ltd.
SI_SUP156	250060 - Hirotec Pune	Released	Hirotec India Private Limited
SI_AMC83	250061 - Juniper switch Support renewal	Released	Mane India Private Limited (Telangana)
SI_IMP141	250067 - SIMS	Released	Saraswathi Institute of Medical Sciences
SI_O-M33	250068 - AMC & O&M for Cisco Stack	Released	Indian Institute of Management (Kozhikode)
SI_SUP168	250071 - Supply of Meraki with 5 Yrs lic	Released	Manipal Health Enterprises Pvt Ltd.
SI_IMP143	250072 - TN School	Released	KS SMART SOLUTIONS PRIVATE LIMITED
SI_IMP142	250074 - Pricol Passive order	Released	Pricol Limited
SI_AMC85	250084 - HP Care pack 5710 switches	Released	L.G.BALAKRISHNAN & BROS LIMITED NAGPUR PLANT - ICD
SI_IMP144	250086 - Pricol - Tray work	Released	Pricol Limited
SP_O-M4	250087 - IVRS L2 Support	Released	Bangalore International Airport Limited
SI_AMC86	250088 - AMC of DC IT Items	Released	Mahanagar Telephone Nigam Limited-Delhi
SI_AMC87	250104 - LCC Zimbra Cloud Renewal	Released	Lakshmi Card Clothing Mfg Company
SI_SUP169	250108 - IBS Software	Released	IBS Software Private Limited
SI_SUP171	250109 - SI of HI Tech Lab Materials	Released	Larsen & Toubro Limited (Tamilnadu)
SI_AMC88	250113 - Firewall AMC Renewal Support	Released	THE TAMILNADU INVESTMENT CORPORATION LTD
SI_IMP147	250115 - Malnad - OTC Charges	Released	Malnad College of Engineering
SI_SUP170	250116 - Supply of Commvault License	Released	Cochin International Airport Limited
MS_SEC20	250120 -Chiefnet Sdwan Support - Bhavani	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC21	250121 - Chiefnet SDwan Support charges	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC19	250122 - Chiefnet SDWAN Support charges	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC22	250123 - Chiefnet SDwan Support Permblur	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC23	250124-Chiefnet SDwan Support Gbichtiplm	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC24	250125 - Chiefnet SDwan Support Satymglm	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC25	250126 - Chiefnet SDwan Support Harur	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC26	250127 - Chiefnet SDwan Support virdungr	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC27	250128 -Chiefnet SDwan Support tiruvnmla	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC18	250129 - Chiefnet SDWAN Charges - Hyd	Released	GAJAANANDA JEWELLERY MAART INDIA PVT LTD
SI_O-M34	250130 - AIIMS O&M_AMC	Released	All India Institute of Medical Sciences
SI_AMC89	250132 - Meraki Support renewal - 3Y	Released	NRD TECH PRIVATE LIMITED
SI_IMP146	250133 - RSAL STEEL	Released	RSAL STEEL PRIVATE LIMITED
SI_AMC90	250152 - LAN Network AMC	Released	Indian Institute Of Information Technology and Management Ke
DC_IMP31	250153 - Aquasub DC work	Released	AQUASUB ENGINEERING
DC_AMC10	250155 - Server Room Non IT Infra AMC	Released	Indian Institute of Management (Kozhikode)
SI_PROF_SER16	250157-Thunder ADC Software Flex Renewal	Released	Medi Assist Healthcare service Limited
SI_SUP173	250162 - Pioneer	Released	Pioneer One Consulting LLP Limited
SI_PROF_SER17	250163 - Fortinet FW Renewal	Released	Lakshmi Card Clothing Mfg Company
CPSO753	250166 - Glasstile Prog kit Supply&Trai	Released	Bangalore International Airport Limited
DC_IMP32	250167- Plumira contractors - Pricol	Released	Plumeria Contracting Services
SI_PROF_SER18	250168 - Zimbra Email Services	Released	Readylink Internet Services Limited
SI_SUP174	250171 - Hirotec license supply	Released	Hirotec India Private Limited
SI_SUP175	250173 - SI of Switch and LAN points	Released	The Marine Products Export Development
SI_AMC91	250183 - MCET SSL Certificate renewal	Released	Dr. Mahalingam College of Engineering and Technology
SI_PROF_SER19	250185 - ATS of Radware Altean ADC/LLB	Released	Centre for Railway Information Systems
SI_SUP176	250186 - IIT Palakkad -Patch Panel	Released	Indian Institute of Technology Palakkad
SI_AMC92	250187 - Cisco Switches AMC	Released	BHARAT PETROLEUM CORPORATION LIMITED
SI_AMC93	250190 - AMC for HP Tape Library	Released	Siemens Healthcare Private Limited
SI_AMC94	250192 - AMC Renewal of Cisco	Released	Royal Sundaram General Insurance Co. Limited
SI_SUP178	250194 - ITCOT Core Switch	Released	SGS Electronics
SI_AMC95	250195 - Fortinet 30E for 1yr	Released	Dimexon Jewellery Creations Pvt Ltd
SI_IMP149	250196 - One Time Execution_AP&Meraki FW	Released	Manipal Health Enterprises Pvt Ltd.
SP_AMC13	250197 - CAMC of Avaya EPABX	Released	Flowserve India Controls Pvt Ltd
SP_O-M5	250199 - PMWANI Support & O_M	Released	Bangalore International Airport Limited
SI_SUP179	250200 - GKNM Analog phone IP adpater	Released	G.Kuppuswamy Naidu Memorial Hospital
SI_IMP150	250203 - LGB Server Room Dressing	Released	L.G. BALAKRISHNAN & BROS LIMITED
SI_IMP154	250213 - AMRI - WiFI Implementation	Released	Manipal Hospital (East) India Limited
SI_IMP151	250217-CRI Pumps Temperature monitor	Released	C.R.I.PUMPS PRIVATE LIMITED
DC_AMC11	250219 - Compressor service charges	Released	Larsen & Toubro Limited (Uttar Pradesh)
SI_SUP107	250221 - FortiGate Renewal	Released	Bangalore International Airport Limited
CPSO99	250223 - Vizag O&M	Released	Larsen & Toubro Limited (Andhra Pradesh)
SI_IMP152	250224 - LGB New office work	Released	L.G. BALAKRISHNAN & BROS LIMITED
MS_SEC28	250227 - Fortinet FW Support Renewal	Released	BK POWER
SI_IMP153	250230 - Pricol Outdoor Camera work	Released	Pricol Limited
SI_SUP181	250232 - Siemens License supply	Released	Siemens Technology and Services Pvt Ltd.
SI_SUP180	250234 - KMCherian Extreme supply	Released	Dr K M Cherian Institute of Medical Sciences Private Limited
SI_SUP184	250236 - Olam Agri UTP Patch Cords	Released	Olam Agri Business Services India Private Limited
SI_IMP158	250238/39/41/42/43-CRI-Tempsensor	Released	C.R.I.PUMPS PRIVATE LIMITED
EA_IMP10	250244 - ENES Additional work order	Released	M/S. ENES TEXTILE MILLS
MS_SEC29	250245 - Chiefnet SDWAN Support, Dmapuri	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC45	250246-Chiefnet SDWAN Support, Kukatplly	Released	GAJAANANDA JEWELLERY MAART INDIA PVT LTD
MS_SEC30	250247 Chiefnet SDWAN Support,Tvnamalai	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC31	250248 - Chiefnet SDWAN Support,Udmlpet	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC32	250249-Chiefnet SDWAN Support,  CBE	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC33	250250-Chiefnet SDWAN Support - Erode	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC34	250251-Chiefnet SDWAN Support - Madurai	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC35	250252-Chiefnet SDWAN Support, Namakkal	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC36	250253-Chiefnet SDWAN Support, Rajaplyam	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC37	250254-Chiefnet SDWAN Support,- Permblur	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC38	250255-Chiefnet SDWAN Support - Bhavani	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC39	250256-Chiefnet SDWAN Support, Gbiciplym	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC40	250257-Chiefnet SDWAN Support- HO Avnshi	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC41	250258-Chiefnet SDWAN Support.Sthamnglm	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC42	250259-Chiefnet SDWAN Support,Virdhnagar	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC43	250260-Chiefnet SDWAN Support,Virdhchlm	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC44	250261-Chiefnet SDWAN Support - Salem	Released	Gajaananda Jewellery Mart India P Ltd
MS_SEC46	250262 - Chiefnet SDWAN Support, Medptnm	Released	GAJAANANDA JEWELLERY MAART INDIA PVT LTD
SI_SUP182	250263 - Icare Supply order	Released	I Care
CL_NEW_SUB5	250272-Ready Link Microsoft O365	Released	Readylink Communication and Services
SI_SUP185	250274 - LGB Annur Wifi	Released	L.G. BALAKRISHNAN & BROS LIMITED
SI_O-M35	250277- Rossi ILL Renewal	Released	Rossi Gearmotors (India) Pvt Ltd
FIELD_O-M10	250282 - ON Call Support - IGH Delhi	Released	Larsen & Toubro Limited (Delhi)
SI_IMP161	250283 - Pricol CCTV Installation	Released	Pricol Limited
SI_IMP160	250292 - NMS Global Ventures	Released	NMS Globl Ventures
SI_IMP163	250293 - Delphi TVS	Released	Delphi-TVS Technologies Limited
SI_IMP162	250295 - Ashok Leyland Sriperumbudur	Released	ASHOK LEYLAND LTD.
SI_AMC96	250309 - Fortinet Firewall renewal	Released	Rossi Gearmotors (India) Pvt Ltd
SI_AMC97	250312 - F5 LLB & SLB support Renewal	Released	Bangalore International Airport Limited
SI_SUP188	250313 - KM Cherian Module supply	Released	Dr K M Cherian Institute of Medical Sciences Private Limited
SI_IMP167	250318 - Innerspace IIMK Kochi	Released	INNERSPACE.INC
DC_AMC12	250319 - AMC of DG, UPS, AC, Smart Rack	Released	Larsen & Toubro Limited (Uttar Pradesh)
SI_IMP164	250321 - NMS global Venture AV system	Released	NMS Globl Ventures
SI_SUP189	250322 - LGB Chennai - Wifi	Released	L.G. BALAKRISHNAN & BROS LIMITED
DC_AMC13	250326 - Datacenter Non IT AMC	Released	SREE CHITRA TIRUNAL INSTITUTE FOR MEDICAL SCIENCES & TECHNOL
SI_IMP166	250327 - NMS Infra	Released	NMS INFRAA
DC_AMC14	250333 - DC- Non IT Infra AMC - T-Fiber	Released	Larsen & Toubro Limited (Telangana)
SI_AMC98	250334 - AMC of Switches & Routers	Released	Lakshmi Card Clothing Mfg Company
SI_O-M36	250338 - Onsite L2 Engineer Support	Released	Elgi Equipment Limited
SI_AMC102	250339 - Network AMC at Elgi ACP Plant	Released	Elgi Equipment Limited
SI_AMC99	250341 - AMC of Network items -  Elgi HO	Released	Elgi Equipment Limited
SI_IMP169	250342 - Mindsprint	Released	Mindsprint Digital India PvtLtd
SI_AMC100	250343 - Network AMC -Elgi Bang/Foundry	Released	Elgi Equipment Limited
SI_AMC101	250344 - Network AMC - Elgi Motor Plant	Released	Elgi Equipment Limited
SI_IMP168	250345 - Elgi Blr CO	Released	Elgi Equipment Limited
CPSO760	250375	Released	Kiran Medical Systems
SI_IMP171	250381-Rossi Gears Network	Released	Rossi Gearmotors (India) Pvt Ltd
SI_AMC106	250382 - Elgi Arista AMC	Released	Elgi Equipment Limited
SI_IMP172	250384 - Elgi CO BLR VC Solution	Released	Elgi Equipment Limited
SI_IMP170	250385 - Mindsprint Arista Switch	Released	Mindsprint Digital India PvtLtd
SI_AMC104	250386 - Web Hosting Services	Released	Gajaananda Jewellery Mart India P Ltd
SI_AMC105	250393 - AMC of Meraki Switches	Released	Checktronix India Private Ltd
SI_IMP173	250394 - Seyyon Firewall	Released	Seyyone Software Solutions Pvt Ltd
SI_IMP176	250396 - RailTel AAI	Released	RailTel Corporation of India Ltd.(Hyd)
SI_PROF_SER22	250398 - Extreme Support Renewal	Released	Dr K M Cherian Institute of Medical Sciences Private Limited
DC_AMC15	250399 - DR Non IT Infra AMC	Released	Regional Cancer Centre
CL_SUB_RE7	250401	Released	TRIVITRON HEALTH CARE
CPSO766	250402	Released	TRIVITRON HEALTH CARE
SI_IMP174	250404 - DSSC Switches installation	Released	DEFENCE SERVICES STAFF COLLEGE
SI_O-M37	250405 - TN School O&M	Released	KS SMART SOLUTIONS PRIVATE LIMITED
SI_IMP175	250406 -IIMK WiFi Network in Hostels	Released	Indian Institute of Management (Kozhikode)
SI_SUP193	250413 - Mindssprit data cable supply	Released	Mindsprint Digital India PvtLtd
SI_IMP177	250414 - Railway Site Survey	Released	SEAMLESS COMMUNICATION SYSTEMS PVT LTD
SI_IMP178	250415 - CheifNet Platform for SDWAN	Released	Infinite NETWORKS
SI_IMP179	250417_BIAL_T1_Upgrade_Fornet FW_SITC	Released	Bangalore International Airport Limited
SI_PROF_SER25	250419 - Domain Renewal Charges	Released	Gajaananda Jewellery Mart India P Ltd
SI_AMC108	250420 - Non Comprehensive AMC 1 year	Released	Center for Brain Research
SI_IMP180	250421 - Seamless Railway	Released	SEAMLESS COMMUNICATION SYSTEMS PVT LTD
SI_AMC107	250422 - Server AMC	Released	Siemens Limited (Maharashtra)
SI_PROF_SER26	250423 - Annual Contract N/w Specialist	Released	Siemens Technology and Services Pvt Ltd.
SI_O-M38	250445 - Tfiber O&M	Released	Larsen & Toubro Limited (Telangana)
CL_NEW_SUB7	250446	Released	Future Generali India Insurance Company
SI_O-M39	250447 - L&T TFiber O&M	Released	Larsen & Toubro Limited (Telangana)
CL_NEW_SUB6	250450	Released	Future Generali India Insurance Company
SP_SUP9	260011 - Netcon Uganda- Acer|	Released	Netcon Technologies Private Limited
SI_O-M40	260013 - ITPL Onsite support 2 engrs	Released	India Trimmings Pvt Ltd
SI_IMP182	260014-ACP Plant WIFI - ELGI	Released	Elgi Equipment Limited
SI_AMC109	260017_MAR_NW Sw_AMC_JAN'24 to Mar'25	Released	Bangalore International Airport Limited
SI_IMP183	260019 - LGB Board Room VC Solution	Released	L.G. BALAKRISHNAN & BROS LIMITED
SI_SUP199	260034 - Supply server Rack	Released	Urban Desk Private Limited
SI_PROF_SER27	260035 O365 License Renewal	Released	International Airport Hotels and Resorts
DC_AMC16	260043 - DC & DR Non IT AMC at MCC	Released	Wipro GE Healthcare Private Limited
MS_CLOUD10	260044	Released	Lakshmi Card Clothing Mfg Company
SI_AMC110	260045 - Firewall Support Renewal	Released	THE TAMILNADU INVESTMENT CORPORATION LTD
SI_SUP200	260047 - IIT Bombay Power Supply	Released	Indian Institute of Technology Bombay
SI_AMC111	260048 - HP support care renewal	Released	L.G. BALAKRISHNAN & BROS LIMITED
SI_IMP185	260052-LGB-VIDEOWALL	Released	L.G. BALAKRISHNAN & BROS LIMITED
SI_SUP202	260062_IITM Prvartak RAM upgrdation	Released	IITM Pravartak Technologies Foundation
SI_CON11	260063 - Service fee for MMRDA project	Released	CHAIN-SYS (INDIA) PRIVATE LIMITED
MS_INFRA2	260068 FCI (NOC/IOC)	Released	Analog and Digital Labs India Pvt Ltd
SI_SUP203	260073- Hirotec Switch & Wifi Supply	Released	Hirotec India Private Limited
SI_AMC112	260074 - DGX A100 AMC	Released	Mahatma Gandhi University
SI_IMP187	260076 - Rossi Gears CCTV order	Released	Rossi Gearmotors (India) Pvt Ltd
SI_AMC113	260077-Fortianalyzer Support Renewal LGB	Released	L.G. BALAKRISHNAN & BROS LIMITED
SI_IMP186	260078 - NTPC Assessment LAN Infra	Released	NTPC Limited - TL
SI_PROF_SER28	260080 Zimbra Email Support renewal	Released	Readylink Internet Services Limited
SI_AMC114	260081-Firewall Support Renewal -1 year	Released	Lakshmi Card Clothing Mfg Company
SI_SUP204	260083 - LGB Cabins Display Supply	Released	L.G. BALAKRISHNAN & BROS LIMITED
SI_IMP196	260084 - SRS - CMET Thrissur	Released	Sukhdevraj Sharma Engineers & Contractors Pvt Ltd.
SI_SUP205	260086 - LGB Aruba WiFi - Coimbatore	Released	L.G. BALAKRISHNAN & BROS LIMITED
SI_SUP206	260087- LGB Aruba Wi-Fi-Bangalore	Released	L.G.BALAKRISHNAN & BROS LIMITED
SI_IMP188	260091 - Elgi Accounts	Released	Elgi Equipment Limited
SP_SUP10	260092-Malawi supply	Released	Netcon Technologies Private Limited
SP_IMP51	260101 - Elgi Sauer -WiFi	Released	ELGI SAUER COMPRESSORS LIMITED
SI_IMP189	260106 - GKNM Nursing college	Released	G.Kuppuswamy Naidu Memorial Hospital
SI_IMP190	260109-Sai pooja-S&I of Firewall	Released	Sai Pooja Travel Wings Private Limited
EA_SUP2	260111-HPE SFP Supply	Released	All India Institute of Medical Sciences (AIIMS)
SI_AMC115	260112 - Firewall Support renewal	Released	Kerala State Electricity Board Limited
SI_IMP194	260113 - SRS NIT Calicut	Released	Sukhdevraj Sharma Engineers & Contractors Pvt Ltd.
SI_SUP210	260114 - LGB Aruba Switch Supply	Released	L.G. BALAKRISHNAN & BROS LIMITED
SI_IMP193	260122-NMS Infra Passive active	Released	NMS INFRAA`;

const extraData = fs.readFileSync('backend/updated_project_list.txt', 'utf8');
const fullData = rawData + '\n' + extraData;

const lines = fullData.trim().split('\n');

const createTableSQL = `
-- Drop existing projects table to avoid conflicts (optional, be careful in prod!)
-- DROP TABLE IF EXISTS projects;

-- Ensure table exists (this should match your schema)
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50),
    account VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

let insertSQL = `INSERT INTO projects (name, description, status, account) VALUES\n`;
const values = [];

for (const line of lines) {
    // Assuming tab separated values based on user's copy-paste
    // It might be spaces, so let's try to detect if tabs are present
    let parts = line.split('\t');

    // If split by tab results in 1 part, it might be heavily spaced. 
    // But usually copy-paste from Excel preserves tabs.
    // Let's filter out empty parts just in case
    parts = parts.filter(p => p && p.trim().length > 0).map(p => p.trim());

    if (parts.length >= 4) {
        const id = parts[0];
        const desc = parts[1];
        const status = parts[2];
        const account = parts[3]; // Rest of the parts form the account if any

        // Escape single quotes for SQL
        const safeId = id.replace(/'/g, "''");
        const safeDesc = desc.replace(/'/g, "''");
        const safeStatus = status.replace(/'/g, "''");
        const safeAccount = account.replace(/'/g, "''");

        values.push(`('${safeId}', '${safeDesc}', '${safeStatus}', '${safeAccount}')`);
    }
}

insertSQL += values.join(",\n") + ";\n";

const fullSQL = insertSQL;
console.log(fullSQL);

fs.writeFileSync('c:/Users/Santhosh B/Downloads/uagpl/archeride1.0-main/backend/seed_live_projects.sql', fullSQL);
