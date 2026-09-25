/**
 * CHRONOS — Interactive Historical Timeline Engine
 * 
 * Features:
 * - Robust CSV Parser (RFC 4180 compliant) with optional Location & Period/Time Range support
 * - Continuous Historical Astronomical Date Parser & Chronological Sorter (BCE / AD)
 * - Intelligent Range/Period Detection & Duration Calculator
 * - Visual Period Indicators: In-Card Journey Tracks + Extended Spine Range Beams connecting Start to End Dates
 * - Written-out dates ("September 1, 1939" & "September 3, 1939 – May 8, 1945") with conditional AD display
 * - Dynamic Section Dividers & Quick Navigation Pills
 * - Optional Location Badge tags on events
 * - Interactive Central Glowing Spine with Scroll-Progress Tracking & Back to Top Button
 * - Event Detail Viewer Modal & In-Browser Event Creator
 * - Dataset Switcher (World War II 1939–1945 & Historical Eras)
 */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// State Management
const state = {
  events: [],
  filteredEvents: [],
  searchQuery: '',
  selectedEvent: null,
  currentDataset: 'roman_leaders.csv',
  activePeriodIds: new Set()
};

// Fallback CSV Datasets (Ensures seamless functionality even on local file://)
const FALLBACK_CIVIL_RIGHTS_CSV = `Date,Label,Location,Description,Image
01/01/1863 AD,Emancipation Proclamation,"Washington, D.C.","President Abraham Lincoln issues the Emancipation Proclamation during the American Civil War, declaring 'that all persons held as slaves' within the rebellious Confederate states 'are, and henceforward shall be free.'",https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80
1865 - 1877 AD,Reconstruction Era,"United States (Southern States)","A transformative period following the Civil War aimed at reintegrating the Southern states and establishing legal, political, and economic rights for newly emancipated African Americans, establishing historic civil rights protections before being dismantled.",https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80
12/06/1865 AD,Ratification of the 13th Amendment,"Washington, D.C.","The 13th Amendment to the United States Constitution is officially ratified, abolishing slavery and involuntary servitude across the entire nation, except as a punishment for a crime.",https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80
04/09/1866 AD,Civil Rights Act of 1866,"Washington, D.C.","Congress enacts the nation's first federal civil rights statute, declaring all persons born in the United States to be citizens regardless of race or previous condition of slavery, passed over President Andrew Johnson's veto.",https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80
07/09/1868 AD,Ratification of the 14th Amendment,"Washington, D.C.","The 14th Amendment is ratified, granting citizenship to all persons born or naturalized in the U.S. and guaranteeing all citizens equal protection of the laws and due process, creating the constitutional bedrock of modern civil rights.",https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80
02/03/1870 AD,Ratification of the 15th Amendment,"Washington, D.C.","The 15th Amendment is ratified, prohibiting the federal government and states from denying or abridging a citizen's right to vote based on 'race, color, or previous condition of servitude.'",https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80
02/25/1870 AD,Hiram Revels Sworn In as First Black Senator,"Washington, D.C. & Mississippi","Hiram Rhodes Revels takes the oath of office as a Republican Senator representing Mississippi, becoming the first African American ever seated in the United States Congress.",https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80
03/01/1875 AD,Civil Rights Act of 1875,"Washington, D.C.","Congress passes landmark legislation affirming the equality of all men before the law and prohibiting racial discrimination in public accommodations, transportation, and jury service.",https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80
03/02/1877 AD,Compromise of 1877 & Rise of Jim Crow,"Washington, D.C. & Southern States","An unwritten political deal settles the disputed 1876 presidential election by awarding Rutherford B. Hayes the presidency in exchange for the withdrawal of federal troops from the South, marking the end of Reconstruction and ushering in state-sanctioned Jim Crow segregation laws and disenfranchisement.",https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80
05/18/1896 AD,Plessy v. Ferguson Supreme Court Ruling,"New Orleans, Louisiana & Washington, D.C.","The Supreme Court upholds Louisiana state racial segregation laws for railroad cars in a 7–1 decision, legalizing the doctrine of 'separate but equal' and giving federal constitutional sanction to Jim Crow laws across the nation.",https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80
07/11/1905 - 07/14/1905 AD,Founding of the Niagara Movement,"Fort Erie, Ontario / Niagara Falls","Led by W.E.B. Du Bois and William Monroe Trotter, a group of 29 Black intellectuals and activists gather near Niagara Falls to draft a manifesto demanding full civil liberties, voting rights, and an end to racial segregation.",https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80
02/12/1909 AD,Founding of the NAACP,"New York City, New York","Founded on the centennial of Abraham Lincoln's birth by an interracial coalition including W.E.B. Du Bois, Ida B. Wells, Mary White Ovington, and Moorfield Storey, the National Association for the Advancement of Colored People is established to wage legal and political campaigns against racial injustice and lynching.",https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80
1916 - 1970 AD,The Great Migration,"Southern to Northern & Western Cities","A monumental demographic movement in which more than six million African Americans migrate from the rural South to the urban Northeast, Midwest, and West to escape Jim Crow terror and seek industrial employment opportunities, transforming American urban culture.",https://images.unsplash.com/photo-1519074069444-1ba4fff16def?auto=format&fit=crop&w=1000&q=80
05/10/1919 - 10/01/1919 AD,Red Summer of 1919,"Chicago, Washington D.C., Elaine (AR) & Nationwide","A wave of violent white supremacist anti-Black riots and massacres erupts across more than three dozen American cities during the post-WWI summer, met with unprecedented armed Black self-defense and community resistance.",https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80
05/31/1921 - 06/01/1921 AD,Tulsa Race Massacre (Tulsa Riot),"Greenwood District, Tulsa, Oklahoma","A heavily armed white mob attacks, burns, and loots the affluent African American Greenwood community—widely known as 'Black Wall Street'. Up to 300 Black residents are killed, more than 1,200 homes and businesses are destroyed, and over 10,000 residents are left homeless in one of the deadliest racial terror massacres in American history.",https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80
1920 - 1938 AD,Harlem Renaissance,"Harlem, New York City","An extraordinary cultural, artistic, and intellectual revival centered in Harlem, celebrating Black identity and producing iconic works by Langston Hughes, Zora Neale Hurston, Duke Ellington, Claude McKay, and Louis Armstrong.",https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80
08/25/1925 AD,Brotherhood of Sleeping Car Porters Organized,"New York City & Chicago","Labor organizer A. Philip Randolph leads the establishment of the Brotherhood of Sleeping Car Porters, the first labor union led by African Americans to receive a charter in the American Federation of Labor (AFL), forming an economic backbone for civil rights activism.",https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1000&q=80
03/25/1931 - 04/09/1931 AD,Scottsboro Boys Arrest & Trials,"Paint Rock & Scottsboro, Alabama","Nine Black teenagers are falsely accused of rape in Alabama. The international outcry and landmark Supreme Court appeals (Powell v. Alabama and Norris v. Alabama) establish fundamental legal precedents guaranteeing the right to effective legal counsel and prohibiting the exclusion of Black jurors.",https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1000&q=80
06/25/1941 AD,Executive Order 8802 (Fair Employment Practice Committee),"Washington, D.C.","Pressured by A. Philip Randolph's threatened March on Washington, President Franklin D. Roosevelt issues Executive Order 8802, banning racial discrimination in the defense industry and creating the Fair Employment Practice Committee (FEPC).",https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1000&q=80
04/15/1947 AD,Jackie Robinson Integrates Major League Baseball,"Ebbets Field, Brooklyn, New York","Jackie Robinson starts at first base for the Brooklyn Dodgers, breaking baseball's six-decade color barrier and becoming a powerful national symbol for integration in American society.",https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80
07/26/1948 AD,Executive Order 9981 (Desegregation of the Military),"Washington, D.C.","President Harry S. Truman issues Executive Order 9981, officially abolishing racial discrimination and establishing equality of treatment and opportunity for all persons in the United States Armed Forces, leading to the desegregation of military units.",https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80
05/17/1954 AD,Brown v. Board of Education Ruling,"Topeka, Kansas & Washington, D.C.","In a unanimous 9–0 decision delivered by Chief Justice Earl Warren, the Supreme Court rules that racial segregation in public schools violates the Equal Protection Clause of the 14th Amendment, overturning the 1896 'separate but equal' doctrine established in Plessy v. Ferguson.",https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80
08/28/1955 - 09/23/1955 AD,Murder of Emmett Till & Trial,"Money & Sumner, Mississippi","Fourteen-year-old African American Emmett Till is brutally lynched in Mississippi after being accused of offending a white woman. His mother Mamie Till-Mobley insists on an open-casket funeral to expose the brutality, galvanizing the national civil rights movement when the all-white jury acquits the perpetrators.",https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80
12/05/1955 - 12/20/1956 AD,Montgomery Bus Boycott,"Montgomery, Alabama","Sparked by Rosa Parks' arrest for refusing to surrender her bus seat, the Black community in Montgomery stages a 381-day boycott of municipal buses led by 26-year-old pastor Dr. Martin Luther King Jr., culminating in the Supreme Court ruling Browder v. Gayle outlawing bus segregation.",https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80
01/10/1957 - 02/14/1957 AD,Founding of the SCLC,"Atlanta, Georgia & New Orleans, Louisiana","Civil rights leaders including Dr. Martin Luther King Jr., Ralph Abernathy, Fred Shuttlesworth, and Bayard Rustin convene to establish the Southern Christian Leadership Conference (SCLC) to coordinate nonviolent direct action protests against segregation across the South.",https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80
09/04/1957 - 09/25/1957 AD,Little Rock Central High School Crisis,"Little Rock, Arkansas","Arkansas Governor Orval Faubus deploys the National Guard to block nine African American students ('Little Rock Nine') from integrating Central High School. President Dwight D. Eisenhower federalizes the National Guard and dispatches the 101st Airborne Division to escort and protect the students.",https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80
02/01/1960 - 07/25/1960 AD,Greensboro Sit-Ins,"Greensboro, North Carolina","Four Black freshmen from North Carolina A&T State University stage a peaceful sit-in at a segregated F. W. Woolworth lunch counter in Greensboro. The nonviolent protest spreads rapidly across 55 Southern cities, leading Woolworth to integrate its dining counters by July.",https://images.unsplash.com/photo-1519074069444-1ba4fff16def?auto=format&fit=crop&w=1000&q=80
04/15/1960 - 04/17/1960 AD,Founding of SNCC at Shaw University,"Raleigh, North Carolina","Organized by veteran civil rights strategist Ella Baker, student sit-in leaders gather at Shaw University to establish the Student Nonviolent Coordinating Committee (SNCC), empowering youth leadership at the forefront of frontline direct-action campaigns.",https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80
05/04/1961 - 12/10/1961 AD,Freedom Rides Across the Deep South,"Washington D.C. to Jackson, Mississippi","Interracial groups of Freedom Riders organized by CORE and SNCC ride interstate buses into the Deep South to test Supreme Court rulings banning segregation. Despite brutal firebombings in Anniston and mob violence in Birmingham and Montgomery, the ICC issues strict enforcement orders banning segregated transit.",https://images.unsplash.com/photo-1579965342575-16428a7c8881?auto=format&fit=crop&w=1000&q=80
11/17/1961 - 08/10/1962 AD,Albany Movement,"Albany, Georgia","A coalition formed by SNCC, the NAACP, and the SCLC conducts citywide boycotts, marches, and mass arrests in Albany, Georgia, testing broad desegregation tactics that proved crucial in preparing strategies for future successful campaigns.",https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80
09/30/1962 - 10/01/1962 AD,Ole Miss Riot & James Meredith Integration,"Oxford, Mississippi","James Meredith becomes the first African American student to enroll at the University of Mississippi (Ole Miss). Segregationist riots erupt on campus, prompting President John F. Kennedy to deploy 31,000 U.S. Army soldiers and federal marshals to restore order and secure his attendance.",https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1000&q=80
04/03/1963 - 05/10/1963 AD,Birmingham Campaign (Project C),"Birmingham, Alabama","A major nonviolent direct-action campaign organized by the SCLC and ACMHR targeting segregation in Birmingham. Public Safety Commissioner Bull Connor deploys high-pressure firehoses and police dogs against student demonstrators during the Children's Crusade, shocking international conscience.",https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1000&q=80
04/16/1963 AD,Letter from Birmingham Jail,"Birmingham Jail, Alabama","While imprisoned for participating in nonviolent demonstrations in Birmingham, Dr. Martin Luther King Jr. writes his seminal manifesto defending nonviolent civil disobedience, declaring that 'Injustice anywhere is a threat to justice everywhere.'",https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80
06/11/1963 AD,Stand in the Schoolhouse Door & JFK Civil Rights Address,"Tuscaloosa, Alabama & Washington D.C.","Alabama Governor George Wallace symbolically blocks the doorway at the University of Alabama to prevent Black students Vivian Malone and James Hood from enrolling until federalized National Guardsmen intervene. That evening, President John F. Kennedy delivers a historic nationwide address defining civil rights as a moral issue.",https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80
06/12/1963 AD,Assassination of Medgar Evers,"Jackson, Mississippi","Medgar Evers, the first field secretary for the NAACP in Mississippi and World War II veteran, is assassinated in his driveway by a white supremacist Ku Klux Klan member hours after JFK's address, sparking national outrage and intensifying demands for federal civil rights legislation.",https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80
08/28/1963 AD,March on Washington for Jobs and Freedom,"Lincoln Memorial, Washington, D.C.","Over 250,000 civil rights demonstrators assemble at the Lincoln Memorial in Washington, D.C. Dr. Martin Luther King Jr. delivers his iconic 'I Have a Dream' speech calling for an end to racism and equality of economic opportunity, in one of the largest political rallies in American history.",https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80
09/15/1963 AD,16th Street Baptist Church Bombing,"Birmingham, Alabama","Ku Klux Klan terrorists detonate a dynamite bomb during Sunday morning service at the 16th Street Baptist Church in Birmingham, killing four young African American girls (Addie Mae Collins, Denise McNair, Carole Robertson, and Cynthia Wesley) and injuring 22 others.",https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80
06/15/1964 - 08/30/1964 AD,Freedom Summer (Mississippi Summer Project),"Mississippi","Over 1,000 out-of-state volunteers join Black Mississippians in a massive campaign organized by the Council of Federated Organizations (COFO) to register Black voters and establish Freedom Schools. The campaign withstands violent terror including the murder of workers James Chaney, Andrew Goodman, and Michael Schwerner.",https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80
07/02/1964 AD,Passage of the Civil Rights Act of 1964,"Washington, D.C.","President Lyndon B. Johnson signs the landmark Civil Rights Act of 1964 into law. The legislation outlaws discrimination based on race, color, religion, sex, or national origin, mandates the desegregation of public accommodations, and establishes the Equal Employment Opportunity Commission (EEOC).",https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80
02/21/1965 AD,Assassination of Malcolm X,"Audubon Ballroom, New York City","Influential human rights activist, orator, and Pan-Africanist leader Malcolm X (el-Hajj Malik el-Shabazz) is assassinated at age 39 while preparing to address the Organization of Afro-American Unity at the Audubon Ballroom in Manhattan.",https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80
03/07/1965 - 03/25/1965 AD,Selma to Montgomery Marches,"Selma to Montgomery, Alabama","Voting rights marchers led by John Lewis and Hosea Williams are brutally attacked by state troopers with tear gas and billy clubs on the Edmund Pettus Bridge on 'Bloody Sunday' (March 7). Reorganizing under federal protection, thousands march 54 miles to the state capitol in Montgomery by March 25.",https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80
08/06/1965 AD,Passage of the Voting Rights Act of 1965,"Washington, D.C.","President Lyndon B. Johnson signs the landmark Voting Rights Act of 1965, prohibiting racial discrimination in voting practices. The law bans literacy tests, provides for federal oversight of voter registration in discriminatory jurisdictions, and secures the franchise for millions of minority citizens.",https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80
01/07/1966 - 08/26/1966 AD,Chicago Freedom Movement,"Chicago, Illinois","The SCLC and CCCO launch a campaign in Chicago expanding the civil rights struggle into Northern urban centers to combat segregated housing, educational disparities, and economic exploitation, culminating in the Chicago Fair Housing Agreement.",https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1000&q=80
10/15/1966 AD,Founding of the Black Panther Party,"Oakland, California","Huey P. Newton and Bobby Seale establish the Black Panther Party for Self-Defense in Oakland, California, advocating for community empowerment, self-defense against police brutality, and social programs including free breakfast for children.",https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=1000&q=80
06/12/1967 AD,Loving v. Virginia Supreme Court Ruling,"Washington, D.C.","In a landmark civil rights decision, the Supreme Court unanimously strikes down Virginia's anti-miscegenation statute, ruling that state laws banning interracial marriage violate the Due Process and Equal Protection Clauses of the 14th Amendment.",https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80
02/12/1968 - 04/16/1968 AD,Memphis Sanitation Workers' Strike,"Memphis, Tennessee","Over 1,300 African American sanitation workers in Memphis strike for 64 days following the gruesome deaths of Echol Cole and Robert Walker in a malfunctioning garbage truck. The strike adopts the iconic slogan 'I AM A MAN' and attracts nationwide labor and civil rights support.",https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80
04/03/1968 AD,"\"I've Been to the Mountaintop\" Speech","Mason Temple, Memphis, Tennessee","Dr. Martin Luther King Jr. delivers his final public speech at Mason Temple in Memphis in support of striking sanitation workers, prophetically stating: 'I've seen the Promised Land. I may not get there with you. But I want you to know tonight, that we, as a people, will get to the promised land.'",https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80
04/04/1968 AD,Assassination of Dr. Martin Luther King Jr.,"Lorraine Motel, Memphis, Tennessee","Dr. Martin Luther King Jr. is fatally shot on the second-floor balcony of the Lorraine Motel in Memphis, Tennessee at age 39. His assassination sparks profound grief and uprisings across more than 100 American cities.",https://images.unsplash.com/photo-1579965342575-16428a7c8881?auto=format&fit=crop&w=1000&q=80
04/11/1968 AD,Passage of the Fair Housing Act (Civil Rights Act of 1968),"Washington, D.C.","President Lyndon B. Johnson signs Title VIII of the Civil Rights Act of 1968 (the Fair Housing Act), prohibiting discrimination in the sale, rental, and financing of housing based on race, religion, or national origin.",https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80
05/12/1968 - 06/24/1968 AD,Poor People's Campaign & Resurrection City,"National Mall, Washington, D.C.","Conceived by Dr. Martin Luther King Jr. and carried forward by Ralph Abernathy, thousands of multi-racial poor Americans establish an encampment named 'Resurrection City' on the National Mall to demand federal legislation addressing poverty and economic inequality.",https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80`;

const FALLBACK_ROMAN_CSV = `Date,Label,Location,Description,Image
0753 BCE - 0716 BCE,Romulus (1st King & Founder of Rome),"Palatine Hill, Rome","Legendary founder and first monarch of Rome. Following the slaying of his twin Remus, Romulus established the initial Roman institutions, organized the earliest legions, formed the Roman Senate with 100 patricians, and consolidated the settlement around the Palatine Hill.",https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80
0509 BCE - 0509 BCE,Lucius Junius Brutus (Founder of the Roman Republic),"Rome, Roman Republic","Leader of the revolt that overthrew the tyrannical seventh king Lucius Tarquinius Superbus, abolishing the Roman Kingdom and founding the Roman Republic. Brutus served as one of the very first elected Consuls alongside Lucius Tarquinius Collatinus.",https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80
0205 BCE - 0184 BCE,Scipio Africanus (Statesman & General),"Rome & Zama, North Africa","One of the greatest military commanders in world history. As Consul and proconsul, Scipio defeated Hannibal Barca at the decisive Battle of Zama in 202 BCE, ending the Second Punic War and cementing Rome as the supreme naval and military hegemon of the Mediterranean.",https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80
0082 BCE - 0079 BCE,Lucius Cornelius Sulla (Dictator of Rome),"Rome, Roman Republic","Roman general and statesman who revived the office of Dictator with indefinite tenure following his civil war victory against the Marian faction. Sulla enacted constitutional reforms to restore senate supremacy before voluntarily relinquishing power in 79 BCE.",https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80
01/10/0049 BCE - 03/15/0044 BCE,Julius Caesar (Dictator Perpetuo),"Rome & the Rubicon, Roman Republic","Crossed the Rubicon river in 49 BCE, initiating Caesar's Civil War. After defeating Pompey, Caesar enacted major agrarian reforms, reformed the calendar (Julian Calendar), and was named Dictator in perpetuity until his assassination on the Ides of March 44 BCE.",https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80
01/16/0027 BCE - 08/19/0014 AD,Augustus (First Roman Emperor),"Rome, Roman Empire","Born Gaius Octavius, Augustus emerged victorious from the civil wars against Mark Antony and Cleopatra to become the founder of the Roman Principate and first Emperor of Rome. His 40-year reign inaugurated the Pax Romana (Roman Peace), widespread building projects, and imperial administrative stability.",https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80
09/18/0014 AD - 03/16/0037 AD,Tiberius (Julio-Claudian Dynasty),"Rome & Capri, Roman Empire","Step-son of Augustus and one of Rome's most capable military generals. Tiberius consolidated the northern frontiers along the Rhine and Danube before retreating from Roman politics in 26 AD to govern remotely from his secluded villa on the Isle of Capri.",https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80
03/16/0037 AD - 01/24/0041 AD,Caligula (Gaius Julius Caesar Augustus),"Rome, Roman Empire","Third Roman Emperor, known for an initially popular reign that rapidly deteriorated into autocratic tyranny, eccentric spending, and political cruelty following a severe illness. Caligula was assassinated in a conspiracy by the Praetorian Guard after less than four years in power.",https://images.unsplash.com/photo-1579965342575-16428a7c8881?auto=format&fit=crop&w=1000&q=80
01/24/0041 AD - 10/13/0054 AD,Claudius,"Rome & Britannia, Roman Empire","Discovered hiding behind a curtain by the Praetorian Guard after Caligula's death. Despite physical infirmities, Claudius proved an able administrator, expanding imperial bureaucracy, executing the successful Roman conquest of Britain in 43 AD, and constructing major public aqueducts.",https://images.unsplash.com/photo-1519074069444-1ba4fff16def?auto=format&fit=crop&w=1000&q=80
10/13/0054 AD - 06/09/0068 AD,Nero (Last of Julio-Claudians),"Rome, Roman Empire","Ascended the throne under the mentorship of Seneca. His rule was marked by artistic pursuits, the Great Fire of Rome in 64 AD, the construction of the lavish Domus Aurea, and severe treason trials. Facing military revolts and Senate condemnation, Nero committed suicide in 68 AD.",https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80
06/08/0068 AD - 12/22/0069 AD,"Year of the Four Emperors (Galba, Otho, Vitellius)","Rome, Roman Empire","A tumultuous year of civil war following Nero's death. Four successive emperors claimed imperial power in rapid succession through military coup before General Vespasian consolidated power and restored stability.",https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1000&q=80
12/21/0069 AD - 06/23/0079 AD,Vespasian (Founder of Flavian Dynasty),"Rome, Roman Empire","Restored financial equilibrium and political stability across the empire following civil strife. Vespasian commenced construction of the Flavian Amphitheatre (Colosseum) in 70 AD and pacified rebellions in Judaea and Gaul.",https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80
06/24/0079 AD - 09/13/0081 AD,Titus (Flavian Dynasty),"Rome & Pompeii, Roman Empire","Eldest son of Vespasian, praised by contemporaries for his generosity. During his short reign, Titus oversaw relief efforts for the catastrophic eruption of Mount Vesuvius in 79 AD and inaugurated the completed Colosseum with 100 days of grand games.",https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80
09/14/0081 AD - 09/18/0096 AD,Domitian (Flavian Dynasty),"Rome & Germania, Roman Empire","Reigned for 15 years, centralizing absolute authority and strengthening imperial administration, economy, and border fortifications (Limes Germanicus), but his autocratic rule alienated the Senate, culminating in his assassination in 96 AD.",https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80
09/18/0096 AD - 01/27/0098 AD,Nerva (Nerva-Antonine Dynasty),"Rome, Roman Empire","Appointed by the Senate after Domitian's assassination. Nerva established the adoptive succession system by selecting the capable military commander Trajan as his heir, ensuring peaceful transitions and initiating the era of the 'Five Good Emperors'.",https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80
01/28/0098 AD - 08/08/0117 AD,Trajan (Optimus Princeps),"Rome, Dacia & Mesopotamia","Officially declared Optimus Princeps ('Best Ruler') by the Senate. Trajan led successful campaigns conquering Dacia and Parthia, expanding the Roman Empire to its maximum territorial extent in human history.",https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80
08/10/0117 AD - 07/10/0138 AD,Hadrian,"Rome & Britannia, Roman Empire","Focused on imperial consolidation and border security rather than military conquest. Hadrian travelled across nearly every province, built Hadrian's Wall across northern Britain, and commissioned the reconstruction of the Pantheon in Rome.",https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1000&q=80
07/10/0138 AD - 03/07/0161 AD,Antoninus Pius,"Rome, Roman Empire","Reigned over the most peaceful epoch of the Imperial era with zero recorded military campaigns led in person. Antoninus managed imperial finances with great fiscal prudence, leaving a substantial treasury surplus.",https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80
03/07/0161 AD - 03/17/0180 AD,Marcus Aurelius (Philosopher Emperor),"Rome & Danube Frontier","The Stoic Philosopher Emperor and author of 'Meditations'. Marcus Aurelius defended the empire through the devastating Antonine Plague and prolonged Marcomannic Wars along the northern Danube frontier.",https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80
03/17/0180 AD - 12/31/0192 AD,Commodus,"Rome, Roman Empire","Son of Marcus Aurelius whose erratic and narcissistic rule marked the conclusion of the Pax Romana. Commodus styled himself as the reincarnation of Hercules, fighting as a gladiator in the Colosseum until his assassination on New Year's Eve 192 AD.",https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1000&q=80
04/09/0193 AD - 02/04/0211 AD,Septimius Severus (Severan Dynasty),"Leptis Magna & Rome","Born in Roman North Africa (modern Libya), Severus seized power after the Year of the Five Emperors. He transformed Rome into a military autocracy, increased legionary pay, and campaigned as far as Caledonia (Scotland).",https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80
02/04/0211 AD - 04/08/0217 AD,Caracalla,"Rome & Syria, Roman Empire","Co-ruled with and then assassinated his brother Geta. Caracalla is famed for issuing the Antonine Constitution (Edict of Caracalla in 212 AD), granting full Roman citizenship to all free inhabitants of the empire, and constructing the massive Baths of Caracalla.",https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80
09/01/0270 AD - 09/01/0275 AD,Aurelian (Restitutor Orbis - Restorer of the World),"Rome, Gaul & Palmyra","Military genius of the Illyrian Emperors during the Crisis of the Third Century. In just five years, Aurelian reconquered the breakaway Gallic Empire and Palmyrene Empire, reunified the fragmented Roman world, and constructed the Aurelian Walls around Rome.",https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80
11/20/0284 AD - 05/01/0305 AD,Diocletian (The Tetrarchy & Dominate),"Nicomedia & Split, Roman Empire","Ended the Crisis of the Third Century by replacing the Principate with the autocratic Dominate and creating the Tetrarchy ('Rule of Four'). Diocletian restructured the military, tax system, and currency before becoming the only emperor to voluntarily abdicate.",https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80
07/25/0306 AD - 05/22/0337 AD,Constantine I the Great,"Constantinople & Rome","First Roman Emperor to convert to Christianity, legalizing the faith through the Edict of Milan (313 AD). Constantine reunified the empire, founded the new imperial capital of Constantinople (Nova Roma) on the Bosphorus, and transformed world history.",https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=1000&q=80
11/03/0361 AD - 06/26/0363 AD,Julian the Apostate,"Constantinople & Mesopotamia","Last pagan emperor of Rome and member of the Constantinian dynasty. Julian rejected Christianity in favor of Neoplatonic Hellenism and led an ambitious invasion of the Sasanian Persian Empire, where he was mortally wounded in battle.",https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80
01/19/0379 AD - 01/17/0395 AD,Theodosius I the Great,"Milan & Constantinople","The last Emperor to rule over both the Western and Eastern halves of the Roman Empire. Theodosius established Nicene Christianity as the state religion of the Roman Empire and officially banned pagan rituals. Upon his death in 395, Rome permanently divided.",https://images.unsplash.com/photo-1579965342575-16428a7c8881?auto=format&fit=crop&w=1000&q=80
01/23/0393 AD - 08/15/0423 AD,Honorius (Western Roman Emperor),"Ravenna & Rome, Western Empire","Younger son of Theodosius I, Honorius moved the Western imperial court from Milan to the defensible marshes of Ravenna. His reign witnessed the Sack of Rome by Alaric's Visigoths in 410 AD, the first time Rome was taken by a foreign enemy in 800 years.",https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80
04/01/0457 AD - 08/02/0461 AD,Majorian (Last Effective Western Emperor),"Ravenna & Gaul, Western Empire","Regarded by historians as the last genuinely capable Western Emperor. Majorian launched vigorous military campaigns reconquering Dalmatia, southern Gaul, and Hispania before being betrayed and assassinated by the general Ricimer.",https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80
10/31/0475 AD - 09/04/0476 AD,Romulus Augustulus & Fall of the Western Roman Empire,"Ravenna, Western Roman Empire","The final Western Roman Emperor, crowned as a child by his patrician father Orestes. On September 4, 476 AD, the Germanic general Odoacer deposed Romulus Augustulus, sending the imperial regalia to Constantinople and marking the traditional fall of the Western Roman Empire.",https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80`;

const FALLBACK_WW2_CSV = `Date,Label,Location,Description,Image
09/01/1939 AD,Invasion of Poland,"Poland / Eastern Europe","Nazi German forces launch a massive surprise invasion of Poland utilizing Blitzkrieg tactics, combining rapid armored thrusts with close air support. In response to the aggression, Great Britain and France declare war on Germany on September 3, marking the official outbreak of World War II in Europe.",https://images.unsplash.com/photo-1579965342575-16428a7c8881?auto=format&fit=crop&w=1000&q=80
09/03/1939 - 05/08/1945 AD,Battle of the Atlantic,"Atlantic Ocean, North Sea & Caribbean","The longest continuous military campaign in World War II. German U-boat 'wolfpacks' and surface raiders duel with Allied naval convoys and anti-submarine air patrols to control transatlantic supply lanes vital to Britain and the Soviet Union's survival.",https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80
05/10/1940 - 06/25/1940 AD,Battle of France,"France, Belgium, Luxembourg & Netherlands","German forces execute Fall Gelb and Fall Rot, bypassing the Maginot Line by striking through the dense Ardennes forest. The rapid six-week campaign overwhelms Allied armies, resulting in the French armistice and the division of France into occupied and Vichy zones.",https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80
05/26/1940 - 06/04/1940 AD,Miracle of Dunkirk (Operation Dynamo),"Dunkirk, Northern France","Allied naval forces and a flotilla of hundreds of civilian 'little ships' evacuate 338,226 British and French soldiers stranded on the beaches of Dunkirk, rescuing the core of the British Army from complete encirclement by German forces.",https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80
06/10/1940 - 05/13/1943 AD,North African Campaign,"Egypt, Libya & Tunisia","A three-year strategic conflict in the deserts of North Africa. British Commonwealth, American, and Free French forces fight Italian and German troops (the Afrika Korps led by Erwin Rommel) for control of the Suez Canal and Middle Eastern oil fields.",https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80
07/10/1940 - 10/31/1940 AD,Battle of Britain,"United Kingdom & English Channel Skies","The Royal Air Force (RAF) engages in the first major military campaign fought entirely by air forces, fiercely defending British skies against relentless bombing raids by the German Luftwaffe and preventing Operation Sea Lion.",https://images.unsplash.com/photo-1519074069444-1ba4fff16def?auto=format&fit=crop&w=1000&q=80
06/22/1941 AD,Operation Barbarossa,"Soviet Union / Eastern Front","Over 3.8 million Axis personnel launch the largest land invasion in human history against the Soviet Union along a 2,900-kilometer front, opening the Eastern Front and drawing the USSR into a total war of survival.",https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1000&q=80
09/08/1941 - 01/27/1944 AD,Siege of Leningrad,"Leningrad (St. Petersburg), USSR","A prolonged military blockade undertaken by the German Army Group North and Finnish forces. Lasting 872 days, the siege caused widespread starvation and claimed over 1 million civilian lives before Soviet forces completely lifted the encirclement.",https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80
12/07/1941 AD,Attack on Pearl Harbor,"Oahu, Hawaii, United States","A carrier-based strike force of the Imperial Japanese Navy launches a devastating surprise aerial attack on the United States Pacific Fleet stationed at Pearl Harbor, Hawaii, bringing the United States directly into World War II.",https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1000&q=80
06/04/1942 - 06/07/1942 AD,Battle of Midway,"Midway Atoll, Central Pacific Ocean","In a decisive four-day naval and air clash near Midway Atoll, US Navy cryptanalysts and dive bombers ambush and sink all four Japanese fleet aircraft carriers (Akagi, Kaga, Soryu, and Hiryu), permanently turning the tide of the Pacific War.",https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80
08/23/1942 - 02/02/1943 AD,Battle of Stalingrad,"Stalingrad (Volgograd), USSR","The fierce five-month confrontation for Stalingrad on the Volga River devolves into savage close-quarters urban combat. Soviet Operation Uranus encircles the German 6th Army, culminating in the surrender of Field Marshal Paulus and turning the strategic tide on the Eastern Front.",https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80
10/23/1942 - 11/11/1942 AD,Second Battle of El Alamein,"El Alamein, Egypt","British Eighth Army under Lieutenant-General Bernard Montgomery launches Operation Lightfoot against Field Marshal Erwin Rommel's Panzer Army Africa in Egypt. The crushing Allied victory halts Axis expansion toward the Suez Canal.",https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80
06/06/1944 AD,D-Day: Normandy Landings (Operation Overlord),"Normandy, Northern France","The largest amphibious invasion in human history commences as over 156,000 Allied troops land across five fortified beachheads (Utah, Omaha, Gold, Juno, Sword) in Normandy, France, establishing a western front to liberate Europe.",https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80
08/25/1944 AD,Liberation of Paris,"Paris, France","Following four years of German occupation and a week-long uprising by the French Resistance, the French 2nd Armored Division and US 4th Infantry Division liberate Paris. General Charles de Gaulle leads a triumphal procession down the Champs-Élysées.",https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80
12/16/1944 - 01/25/1945 AD,Battle of the Bulge,"Ardennes Forest, Belgium & Luxembourg","Adolf Hitler launches a major counter-offensive through the forested Ardennes region in Belgium, aiming to split Allied armies and recapture Antwerp. Despite initial German surprise advances, stubborn American defense at Bastogne and Allied air power repel the assault.",https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=1000&q=80
02/19/1945 - 03/26/1945 AD,Battle of Iwo Jima,"Iwo Jima, Volcano Islands, Japan","United States Marine Corps units make amphibious landings on the volcanic island of Iwo Jima to secure key emergency airfields for B-29 bombers, culminating in the iconic raising of the American flag atop Mount Suribachi.",https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80
04/16/1945 - 05/02/1945 AD,Battle of Berlin,"Berlin, Germany","The final major European offensive of World War II. Soviet Red Army forces surround and assault the Nazi capital street-by-street. On April 30, Adolf Hitler commits suicide in his underground bunker, and the Berlin garrison surrenders on May 2.",https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1000&q=80
05/08/1945 AD,Victory in Europe (V-E Day),"Reims, France & Berlin, Germany","The German High Command issues an unconditional surrender of all German forces to Allied commanders in Reims and Berlin, formally ending the war in Europe and triggering jubilant celebrations across Allied nations.",https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80
08/06/1945 AD,Atomic Bombing of Hiroshima,"Hiroshima, Japan","The US Army Air Forces B-29 Superfortress 'Enola Gay' drops the uranium-fueled atomic bomb 'Little Boy' over Hiroshima, Japan, followed by 'Fat Man' over Nagasaki on August 9, demonstrating the unprecedented destructive power of nuclear warfare.",https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80
09/02/1945 AD,Victory over Japan & Formal Surrender,"Tokyo Bay (USS Missouri), Japan","Representatives of the Empire of Japan sign the Japanese Instrument of Surrender aboard the battleship USS Missouri anchored in Tokyo Bay in the presence of General Douglas MacArthur and Allied representatives, officially concluding World War II.",https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80`;

const FALLBACK_ERAS_CSV = `Date,Label,Location,Description,Image
01/10/0049 BCE,Caesar Crosses the Rubicon,"Rubicon River, Northern Italy","Julius Caesar leads the Legio XIII Gemina across the Rubicon river in northern Italy, uttering the famous phrase 'Alea iacta est' (The die is cast). This act of treason ignited Caesar's Civil War, which ultimately paved the way for the transformation of the Roman Republic into the Roman Empire.",https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80
08/24/0079 AD,Eruption of Mount Vesuvius,"Pompeii & Herculaneum, Roman Empire","Mount Vesuvius violently erupts over two days, unleashing a devastating column of volcanic gas, pumice, and ash. The catastrophic eruption completely buried and preserved the prosperous Roman cities of Pompeii and Herculaneum under meters of volcanic debris.",https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=80
07/20/1969 AD,Apollo 11 Moon Landing,"Mare Tranquillitatis, The Moon","American astronauts Neil Armstrong and Buzz Aldrin become the first humans to land on the lunar surface aboard the Apollo 11 Lunar Module Eagle. Armstrong proclaims 'That's one small step for [a] man, one giant leap for mankind' as over 650 million viewers watch worldwide.",https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80`;

// DOM Elements
const DOM = {
  mobileHeaderToggle: document.getElementById('mobileHeaderToggle'),
  headerExpandable: document.getElementById('headerExpandable'),
  datasetSelect: document.getElementById('datasetSelect'),
  timelineEvents: document.getElementById('timelineEvents'),
  timelineSpineProgress: document.getElementById('timelineSpineProgress'),
  timelineContainer: document.getElementById('timelineContainer'),
  emptyState: document.getElementById('emptyState'),
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  eventCountBadge: document.getElementById('eventCountBadge'),
  csvFileInput: document.getElementById('csvFileInput'),
  emptyResetBtn: document.getElementById('emptyResetBtn'),
  backToTopBtn: document.getElementById('backToTopBtn'),

  // Detail Modal
  detailModalBackdrop: document.getElementById('detailModalBackdrop'),
  closeDetailModalBtn: document.getElementById('closeDetailModalBtn'),
  modalImageContainer: document.getElementById('modalImageContainer'),
  modalImage: document.getElementById('modalImage'),
  modalDate: document.getElementById('modalDate'),
  modalLocationBadge: document.getElementById('modalLocationBadge'),
  modalLocationText: document.getElementById('modalLocationText'),
  modalDurationBadge: document.getElementById('modalDurationBadge'),
  modalDurationText: document.getElementById('modalDurationText'),
  modalTitle: document.getElementById('modalTitle'),
  modalDescription: document.getElementById('modalDescription'),

  // Add Event Modal
  addModalBackdrop: document.getElementById('addModalBackdrop'),
  openAddModalBtn: document.getElementById('openAddModalBtn'),
  closeAddModalBtn: document.getElementById('closeAddModalBtn'),
  cancelAddBtn: document.getElementById('cancelAddBtn'),
  addEventForm: document.getElementById('addEventForm'),
  eventDateInput: document.getElementById('eventDateInput'),
  eventEraSelect: document.getElementById('eventEraSelect'),
  eventLabelInput: document.getElementById('eventLabelInput'),
  eventLocationInput: document.getElementById('eventLocationInput'),
  eventDescInput: document.getElementById('eventDescInput'),
  eventImageInput: document.getElementById('eventImageInput'),

  // Toast
  toast: document.getElementById('toast'),
  toastMessage: document.getElementById('toastMessage')
};

// ==========================================
// 1. CSV Parser (RFC 4180 Compliant)
// ==========================================
function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push("");
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // handle CRLF
      }
      if (row.length > 1 || row[0].trim() !== "") {
        lines.push(row);
      }
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }

  if (row.length > 1 || row[0].trim() !== "") {
    lines.push(row);
  }

  if (lines.length < 2) return [];

  // Parse Headers
  const headers = lines[0].map(h => h.trim().toLowerCase());
  const dateIdx = headers.findIndex(h => h.includes('date'));
  const labelIdx = headers.findIndex(h => h.includes('label') || h.includes('title') || h.includes('name'));
  const locationIdx = headers.findIndex(h => h.includes('location') || h.includes('place') || h.includes('city') || h.includes('country') || h.includes('site') || h.includes('geo'));
  const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('detail') || h.includes('text') || h.includes('summary'));
  const imageIdx = headers.findIndex(h => h.includes('image') || h.includes('img') || h.includes('pic') || h.includes('url') || h.includes('link'));

  const rawRows = [];

  for (let i = 1; i < lines.length; i++) {
    const r = lines[i];
    if (r.length <= 1 && (!r[0] || r[0].trim() === "")) continue;

    const rawDate = (dateIdx !== -1 && r[dateIdx] !== undefined) ? r[dateIdx].trim() : (r[0] || '').trim();
    const rawLabel = (labelIdx !== -1 && r[labelIdx] !== undefined) ? r[labelIdx].trim() : (r[1] || 'Untitled Event').trim();
    const rawLocation = (locationIdx !== -1 && r[locationIdx] !== undefined) ? r[locationIdx].trim() : '';
    const rawDesc = (descIdx !== -1 && r[descIdx] !== undefined) ? r[descIdx].trim() : (r[2] || '').trim();
    const rawImage = (imageIdx !== -1 && r[imageIdx] !== undefined) ? r[imageIdx].trim() : (r[3] || '').trim();

    if (!rawDate && !rawLabel) continue;

    rawRows.push({ rawDate, rawLabel, rawLocation, rawDesc, rawImage, id: `event-${i}` });
  }

  // Check if timeline contains any BCE events
  const hasBCE = rawRows.some(row => /BCE|BC/i.test(row.rawDate));

  return rawRows.map(r => processEventData(r.rawDate, r.rawLabel, r.rawLocation, r.rawDesc, r.rawImage, r.id, hasBCE));
}

// ==========================================
// 2. Date Processing & Astronomical Sorting
// ==========================================
function parseSingleDate(rawDatePart, defaultIsBCE = false, hasBCEContext = false) {
  const normalized = (rawDatePart || '').trim();
  let isBCE = defaultIsBCE;
  if (/BCE|BC/i.test(normalized)) {
    isBCE = true;
  } else if (/AD|CE/i.test(normalized)) {
    isBCE = false;
  }
  const cleanStr = normalized.replace(/BCE|BC|AD|CE/gi, '').trim();

  let month = 1;
  let day = 1;
  let year = 1;
  let hasSpecificMonth = false;
  let hasSpecificDay = false;

  const slashParts = cleanStr.split('/');
  const dashParts = cleanStr.split('-');

  if (slashParts.length === 3) {
    month = parseInt(slashParts[0], 10) || 1;
    day = parseInt(slashParts[1], 10) || 1;
    year = parseInt(slashParts[2], 10) || 1;
    hasSpecificMonth = true;
    hasSpecificDay = true;
  } else if (dashParts.length === 3 && dashParts[0].length === 4) {
    year = parseInt(dashParts[0], 10) || 1;
    month = parseInt(dashParts[1], 10) || 1;
    day = parseInt(dashParts[2], 10) || 1;
    hasSpecificMonth = true;
    hasSpecificDay = true;
  } else if (slashParts.length === 2) {
    month = parseInt(slashParts[0], 10) || 1;
    year = parseInt(slashParts[1], 10) || 1;
    hasSpecificMonth = true;
  } else {
    const matchedYear = cleanStr.match(/\d+/);
    if (matchedYear) {
      year = parseInt(matchedYear[0], 10);
    }
  }

  const monthFraction = (Math.min(Math.max(month, 1), 12) - 1) / 12;
  const dayFraction = (Math.min(Math.max(day, 1), 31) - 1) / 365;
  const yearFraction = monthFraction + (dayFraction / 12);

  let sortValue = isBCE ? (-year + yearFraction) : (year + yearFraction);

  let suffix = '';
  if (isBCE) {
    suffix = ' BCE';
  } else if (hasBCEContext) {
    suffix = ' AD';
  }

  const safeMonthIdx = Math.min(Math.max(month - 1, 0), 11);
  const monthName = MONTH_NAMES[safeMonthIdx];

  let displayStr = '';
  if (hasSpecificMonth && hasSpecificDay) {
    displayStr = `${monthName} ${day}, ${year}${suffix}`;
  } else if (hasSpecificMonth) {
    displayStr = `${monthName} ${year}${suffix}`;
  } else {
    displayStr = `${year}${suffix}`;
  }

  return {
    year,
    month,
    day,
    monthName,
    isBCE,
    hasSpecificMonth,
    hasSpecificDay,
    sortValue,
    displayStr,
    suffix
  };
}

function calculateDuration(start, end) {
  const diffYears = Math.abs(end.sortValue - start.sortValue);
  const totalDays = Math.max(1, Math.round(diffYears * 365.25));

  if (diffYears >= 1.0) {
    const fullYears = Math.floor(diffYears);
    const remMonths = Math.round((diffYears - fullYears) * 12);
    if (remMonths > 0) {
      return `${fullYears} ${fullYears === 1 ? 'Year' : 'Years'}, ${remMonths} ${remMonths === 1 ? 'Month' : 'Months'}`;
    }
    return `${fullYears} ${fullYears === 1 ? 'Year' : 'Years'}`;
  } else if (totalDays >= 30) {
    const fullMonths = Math.max(1, Math.round(totalDays / 30.4));
    const remDays = Math.round(totalDays % 30.4);
    if (remDays >= 5 && fullMonths < 12) {
      return `${fullMonths} ${fullMonths === 1 ? 'Month' : 'Months'}, ${remDays} Days`;
    }
    return `${fullMonths} ${fullMonths === 1 ? 'Month' : 'Months'}`;
  } else if (totalDays >= 7) {
    const weeks = Math.round(totalDays / 7);
    return `${weeks} ${weeks === 1 ? 'Week' : 'Weeks'}`;
  } else {
    return `${totalDays} ${totalDays === 1 ? 'Day' : 'Days'}`;
  }
}

function processEventData(rawDateStr, label, location, description, image, id, hasBCEContext = false) {
  const normalizedDate = (rawDateStr || '').trim();

  // Detect time range delimiters: " - ", " – ", " — ", or " to "
  const rangeRegex = /\s*[-–—]\s*|\s+to\s+/i;
  const isRange = rangeRegex.test(normalizedDate);

  let startDateInfo;
  let endDateInfo = null;
  let durationText = '';
  let formattedDate = '';

  const defaultBCE = /BCE|BC/i.test(normalizedDate);

  if (isRange) {
    const parts = normalizedDate.split(rangeRegex);
    startDateInfo = parseSingleDate(parts[0], defaultBCE, hasBCEContext);
    endDateInfo = parseSingleDate(parts[1], defaultBCE, hasBCEContext);

    // Format written range
    if (startDateInfo.year === endDateInfo.year && !startDateInfo.isBCE && !endDateInfo.isBCE && !hasBCEContext) {
      if (startDateInfo.hasSpecificMonth && endDateInfo.hasSpecificMonth) {
        if (startDateInfo.month === endDateInfo.month && startDateInfo.hasSpecificDay && endDateInfo.hasSpecificDay) {
          formattedDate = `${startDateInfo.monthName} ${startDateInfo.day}–${endDateInfo.day}, ${startDateInfo.year}`;
        } else {
          const sDay = startDateInfo.hasSpecificDay ? ` ${startDateInfo.day}` : '';
          const eDay = endDateInfo.hasSpecificDay ? ` ${endDateInfo.day}` : '';
          formattedDate = `${startDateInfo.monthName}${sDay} – ${endDateInfo.monthName}${eDay}, ${startDateInfo.year}`;
        }
      } else {
        formattedDate = `${startDateInfo.year}`;
      }
    } else {
      formattedDate = `${startDateInfo.displayStr} – ${endDateInfo.displayStr}`;
    }

    durationText = calculateDuration(startDateInfo, endDateInfo);
  } else {
    startDateInfo = parseSingleDate(normalizedDate, defaultBCE, hasBCEContext);
    formattedDate = startDateInfo.displayStr;
  }

  return {
    id: id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    rawDate: rawDateStr,
    displayDate: formattedDate,
    sortValue: startDateInfo.sortValue,
    year: startDateInfo.year,
    isBCE: startDateInfo.isBCE,
    isRange: isRange,
    startDate: startDateInfo.displayStr,
    endDate: endDateInfo ? endDateInfo.displayStr : '',
    startSortValue: startDateInfo.sortValue,
    endSortValue: endDateInfo ? endDateInfo.sortValue : startDateInfo.sortValue,
    durationText: durationText,
    label: label || 'Historical Event',
    location: location || '',
    description: description || 'No description provided.',
    image: image || ''
  };
}

// ==========================================
// 3. Application Initialization & Loader
// ==========================================
async function initTimeline() {
  setupEventListeners();
  loadDataset(state.currentDataset);
}

async function loadDataset(datasetFilename) {
  state.currentDataset = datasetFilename;
  if (DOM.datasetSelect) {
    DOM.datasetSelect.value = datasetFilename;
  }

  try {
    const response = await fetch(datasetFilename);
    if (!response.ok) throw new Error('HTTP request failed');
    const csvContent = await response.text();
    loadEventsFromCsvContent(csvContent, `Loaded ${datasetFilename}`);
  } catch (err) {
    console.warn(`Fetch for ${datasetFilename} failed (e.g. running from local file://), using fallback:`, err);
    let fallbackText = FALLBACK_WW2_CSV;
    let fallbackName = 'World War II Timeline';
    if (datasetFilename === 'events.csv') {
      fallbackText = FALLBACK_ERAS_CSV;
      fallbackName = 'Historical Eras';
    } else if (datasetFilename === 'roman_leaders.csv') {
      fallbackText = FALLBACK_ROMAN_CSV;
      fallbackName = 'Roman Leaders & Emperors';
    } else if (datasetFilename === 'civil_rights_events.csv') {
      fallbackText = FALLBACK_CIVIL_RIGHTS_CSV;
      fallbackName = 'US Civil Rights Movement';
    }
    loadEventsFromCsvContent(fallbackText, `Loaded ${fallbackName}`);
  }
}

function loadEventsFromCsvContent(csvText, successToastMessage) {
  const parsed = parseCSV(csvText);
  if (parsed.length === 0) {
    showToast('Warning: No valid events found in CSV');
    return;
  }

  // Sort Chronologically: Earlier events at top (smallest / most negative sortValue first)
  parsed.sort((a, b) => a.sortValue - b.sortValue);

  state.events = parsed;
  applyFilters();

  if (successToastMessage) {
    showToast(successToastMessage);
  }
}

// ==========================================
// 4. Filtering & Rendering
// ==========================================
function applyFilters() {
  const query = state.searchQuery.toLowerCase().trim();
  const parsedYear = parseYearQuery(query);

  if (query) {
    // Search query filter across label, desc, location, and dates
    const textMatches = state.events.filter(event => {
      const matchLabel = event.label.toLowerCase().includes(query);
      const matchDesc = event.description.toLowerCase().includes(query);
      const matchLocation = event.location ? event.location.toLowerCase().includes(query) : false;
      const matchDate = event.displayDate.toLowerCase().includes(query) || event.rawDate.toLowerCase().includes(query);
      return matchLabel || matchDesc || matchLocation || matchDate;
    });

    if (textMatches.length > 0) {
      state.filteredEvents = textMatches;
      removeYearLocator();
    } else if (parsedYear) {
      // User typed a specific year that has no direct events recorded.
      // Keep full timeline visible so chronological context is intact,
      // and navigate directly to where that year belongs!
      state.filteredEvents = state.events;
      renderTimeline();
      updateStats();
      navigateToYearPosition(parsedYear, false);
      return;
    } else {
      state.filteredEvents = [];
      removeYearLocator();
    }
  } else {
    state.filteredEvents = state.events;
    removeYearLocator();
  }

  renderTimeline();
  updateStats();

  // If user entered a matching year query, scroll to the exact match
  if (parsedYear && state.filteredEvents.length > 0) {
    navigateToYearPosition(parsedYear, true);
  }
}

function renderTimeline() {
  DOM.timelineEvents.innerHTML = '';

  if (state.filteredEvents.length === 0) {
    DOM.emptyState.style.display = 'block';
    DOM.timelineSpineProgress.style.height = '0%';
    return;
  }

  DOM.emptyState.style.display = 'none';

  // Check if dataset spans multiple eras or a single continuous era
  const hasBCE = state.events.some(e => e.isBCE);
  const minYear = Math.min(...state.events.map(e => e.year));
  const maxYear = Math.max(...state.events.map(e => e.year));
  const isMultiEra = hasBCE || (maxYear - minYear > 100);

  let currentSectionHeader = null;

  state.filteredEvents.forEach((event, index) => {
    // Generate Section Dividers
    let sectionKey;
    let sectionLabel;

    if (isMultiEra) {
      if (event.isBCE) {
        sectionKey = 'bce-era';
        sectionLabel = 'Before Common Era (BCE)';
      } else if (event.year <= 1500) {
        sectionKey = 'early-ad';
        sectionLabel = hasBCE ? 'Common Era (AD)' : 'Early Era';
      } else {
        sectionKey = 'modern-era';
        sectionLabel = 'Modern Era';
      }
    } else {
      sectionKey = `year-${event.year}`;
      sectionLabel = `${event.year}`;
    }

    if (sectionKey !== currentSectionHeader) {
      currentSectionHeader = sectionKey;
      const eraDivider = document.createElement('div');
      eraDivider.className = 'era-divider';
      eraDivider.id = `section-anchor-${sectionKey}`;
      eraDivider.innerHTML = `
        <div class="era-divider-pill">
          ${sectionLabel}
        </div>
      `;
      DOM.timelineEvents.appendChild(eraDivider);
    }

    // Determine left or right alternating card
    const side = index % 2 === 0 ? 'left' : 'right';

    const itemEl = document.createElement('div');
    itemEl.className = `timeline-item ${side} ${event.isRange ? 'is-period' : ''}`;
    itemEl.setAttribute('data-id', event.id);

    // Optional Duration Badge for periods
    const durationMarkup = event.isRange && event.durationText
      ? `<span class="duration-badge" title="Duration of Campaign/Period">
           <i data-lucide="clock" style="width:12px;height:12px;"></i>
           ${escapeHtml(event.durationText)}
         </span>`
      : '';

    // Optional Location Badge
    const locationMarkup = event.location
      ? `<span class="location-badge" title="Event Location">
           <i data-lucide="map-pin" style="width:12px;height:12px;"></i>
           ${escapeHtml(event.location)}
         </span>`
      : '';

    // In-Card Period Journey Track & Toggle Switch
    const periodTrackMarkup = event.isRange ? `
      <div class="period-span-indicator">
        <div class="period-span-step start">
          <span class="period-step-icon"><i data-lucide="play" style="width:11px;height:11px;"></i></span>
          <div class="period-step-info">
            <span class="period-step-type">Commenced</span>
            <span class="period-step-date">${escapeHtml(event.startDate)}</span>
          </div>
        </div>
        <div class="period-span-line">
          <span class="period-span-tag">${escapeHtml(event.durationText)}</span>
        </div>
        <div class="period-span-step end">
          <span class="period-step-icon"><i data-lucide="flag" style="width:11px;height:11px;"></i></span>
          <div class="period-step-info">
            <span class="period-step-type">Concluded</span>
            <span class="period-step-date">${escapeHtml(event.endDate)}</span>
          </div>
        </div>
      </div>
      <div class="period-toggle-row">
        <label class="toggle-switch-wrapper" onclick="event.stopPropagation()">
          <input type="checkbox" class="period-toggle-input" data-period-id="${event.id}" ${state.activePeriodIds.has(event.id) ? 'checked' : ''}>
          <span class="toggle-slider-track">
            <span class="toggle-slider-thumb"></span>
          </span>
          <span class="toggle-switch-text">Show period on timeline</span>
        </label>
      </div>
    ` : '';

    // Fallback Image Handler
    const imageMarkup = event.image
      ? `<div class="event-card-media">
           <img src="${escapeHtml(event.image)}" alt="${escapeHtml(event.label)}" loading="lazy" onerror="this.parentElement.style.display='none'">
           <div class="event-media-gradient"></div>
         </div>`
      : '';

    itemEl.innerHTML = `
      <div class="timeline-pin" title="${escapeHtml(event.displayDate)} ${event.durationText ? `(${event.durationText})` : ''}">
        ${event.isRange ? '<i data-lucide="calendar-range" style="width:11px;height:11px;color:#ffbe0b;"></i>' : ''}
      </div>
      <div class="event-card" role="button" tabindex="0" aria-label="View details for ${escapeHtml(event.label)}">
        ${imageMarkup}
        <div class="event-card-body">
          <div class="event-meta-row">
            <span class="date-badge">
              <i data-lucide="calendar" style="width:14px;height:14px;"></i>
              ${escapeHtml(event.displayDate)}
            </span>
            ${durationMarkup}
            ${locationMarkup}
          </div>
          <h2 class="event-title">${highlightMatch(event.label, state.searchQuery)}</h2>
          ${periodTrackMarkup}
          <p class="event-snippet">${highlightMatch(event.description, state.searchQuery)}</p>
          <div class="event-footer">
            <span class="read-more-link">Full details <i data-lucide="arrow-right" style="width:14px;height:14px;"></i></span>
          </div>
        </div>
      </div>
    `;

    // Toggle Switch Change Listener
    const toggleInput = itemEl.querySelector('.period-toggle-input');
    if (toggleInput) {
      toggleInput.addEventListener('change', (e) => {
        e.stopPropagation();
        if (e.target.checked) {
          state.activePeriodIds.add(event.id);
        } else {
          state.activePeriodIds.delete(event.id);
        }
        calculateSpineRangeBeams();
      });
    }

    // Click to inspect modal
    const cardEl = itemEl.querySelector('.event-card');
    cardEl.addEventListener('click', () => openDetailModal(event));
    cardEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDetailModal(event);
      }
    });

    DOM.timelineEvents.appendChild(itemEl);
  });

  // Calculate & Draw Vertical Spine Range Beams
  setTimeout(calculateSpineRangeBeams, 60);

  // Re-initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Update central spine scroll progress
  updateScrollProgress();
}

// ==========================================
// 5. Vertical Spine Range Beams Calculation (Non-Overlapping Parallel Lanes)
// ==========================================
const PERIOD_PALETTES = [
  { primary: '#ffbe0b', gradient: 'linear-gradient(180deg, #ffbe0b 0%, #fb5607 100%)', glow: 'rgba(255, 190, 11, 0.6)' },
  { primary: '#00d2ff', gradient: 'linear-gradient(180deg, #00d2ff 0%, #3a86ff 100%)', glow: 'rgba(0, 210, 255, 0.6)' },
  { primary: '#06d6a0', gradient: 'linear-gradient(180deg, #06d6a0 0%, #118ab2 100%)', glow: 'rgba(6, 214, 160, 0.6)' },
  { primary: '#ff006e', gradient: 'linear-gradient(180deg, #ff006e 0%, #8338ec 100%)', glow: 'rgba(255, 0, 110, 0.6)' },
  { primary: '#c77dff', gradient: 'linear-gradient(180deg, #c77dff 0%, #7b2cbf 100%)', glow: 'rgba(199, 125, 255, 0.6)' },
  { primary: '#f77f00', gradient: 'linear-gradient(180deg, #f77f00 0%, #d62828 100%)', glow: 'rgba(247, 127, 0, 0.6)' }
];

function calculateSpineRangeBeams() {
  // Remove existing dynamic spine beams
  document.querySelectorAll('.spine-range-beam').forEach(el => el.remove());

  // Only calculate beams for periods currently toggled ON
  const periodItems = Array.from(DOM.timelineEvents.querySelectorAll('.timeline-item.is-period'))
    .filter(itemEl => {
      const eventId = itemEl.getAttribute('data-id');
      return state.activePeriodIds.has(eventId);
    });

  const allItems = Array.from(DOM.timelineEvents.querySelectorAll('.timeline-item'));

  if (periodItems.length === 0) return;

  const isMobile = window.innerWidth <= 860;

  // 1. Pack overlapping active periods into dedicated non-overlapping parallel lanes
  const lanes = []; // Stores the active endSortValue for each lane
  const itemLaneData = [];

  periodItems.forEach(itemEl => {
    const eventId = itemEl.getAttribute('data-id');
    const event = state.filteredEvents.find(e => e.id === eventId);
    if (!event || !event.isRange) return;

    let assignedLane = -1;
    for (let i = 0; i < lanes.length; i++) {
      if (event.startSortValue >= lanes[i]) {
        assignedLane = i;
        lanes[i] = event.endSortValue;
        break;
      }
    }

    if (assignedLane === -1) {
      assignedLane = lanes.length;
      lanes.push(event.endSortValue);
    }

    itemLaneData.push({ itemEl, event, lane: assignedLane });
  });

  // 2. Position each period's beam in its assigned parallel track
  itemLaneData.forEach(({ itemEl, event, lane }) => {
    const palette = PERIOD_PALETTES[lane % PERIOD_PALETTES.length];

    // Find the nearest subsequent timeline item that occurs at or after the period's end date
    const currentIndex = allItems.indexOf(itemEl);
    let targetItem = null;

    for (let i = currentIndex + 1; i < allItems.length; i++) {
      const candidateId = allItems[i].getAttribute('data-id');
      const candidateEvent = state.filteredEvents.find(e => e.id === candidateId);
      if (candidateEvent && candidateEvent.sortValue >= event.endSortValue) {
        targetItem = allItems[i];
        break;
      }
    }

    // Determine vertical span distance
    let beamHeight = 0;
    const startPinY = itemEl.offsetTop + 28;

    if (targetItem) {
      const endPinY = targetItem.offsetTop + 28;
      beamHeight = Math.max(70, endPinY - startPinY);
    } else {
      beamHeight = Math.max(80, itemEl.offsetHeight + 35);
    }

    // Calculate parallel track horizontal offset
    let laneOffsetPx = 0;
    let bridgeLeft = 0;
    let bridgeWidth = 0;

    if (isMobile) {
      // On mobile (spine is at 24px), lanes stagger to the right: 12px, 20px, 28px...
      laneOffsetPx = 24 + 14 + (lane * 9);
      bridgeLeft = 24;
      bridgeWidth = laneOffsetPx - 24;
    } else {
      // On desktop (spine is at 50%), lanes alternate left and right:
      // Lane 0: +14px (Right), Lane 1: -14px (Left), Lane 2: +24px (Right), Lane 3: -24px (Left)...
      const sideSign = (lane % 2 === 0) ? 1 : -1;
      const step = 14 + Math.floor(lane / 2) * 10;
      laneOffsetPx = sideSign * step;

      if (sideSign > 0) {
        bridgeLeft = 0;
        bridgeWidth = laneOffsetPx;
      } else {
        bridgeLeft = laneOffsetPx;
        bridgeWidth = Math.abs(laneOffsetPx);
      }
    }

    // Create the beam element
    const beamEl = document.createElement('div');
    beamEl.className = 'spine-range-beam';
    beamEl.style.top = '28px';
    beamEl.style.height = `${beamHeight}px`;
    beamEl.style.color = palette.primary;
    beamEl.style.background = palette.gradient;
    beamEl.style.boxShadow = `0 0 12px ${palette.glow}`;

    if (isMobile) {
      beamEl.style.left = `${laneOffsetPx}px`;
    } else {
      beamEl.style.left = `calc(50% + ${laneOffsetPx}px)`;
    }

    // Horizontal bridge at start (connects spine node to the parallel lane)
    const topBridge = document.createElement('div');
    topBridge.className = 'spine-range-bridge-top';
    topBridge.style.width = `${Math.max(4, bridgeWidth)}px`;
    topBridge.style.color = palette.primary;
    if (isMobile) {
      topBridge.style.left = `${bridgeLeft - laneOffsetPx}px`;
    } else {
      topBridge.style.left = laneOffsetPx > 0 ? `-${bridgeWidth}px` : '0px';
    }

    // Horizontal bridge at end (connects parallel lane to end cap)
    const bottomBridge = document.createElement('div');
    bottomBridge.className = 'spine-range-bridge-bottom';
    bottomBridge.style.width = `${Math.max(4, bridgeWidth)}px`;
    bottomBridge.style.color = palette.primary;
    if (isMobile) {
      bottomBridge.style.left = `${bridgeLeft - laneOffsetPx}px`;
    } else {
      bottomBridge.style.left = laneOffsetPx > 0 ? `-${bridgeWidth}px` : '0px';
    }

    beamEl.appendChild(topBridge);
    beamEl.appendChild(bottomBridge);

    // End terminal anchor cap
    const endCap = document.createElement('div');
    endCap.className = 'spine-range-end-cap';
    endCap.style.color = palette.primary;
    endCap.title = `Conclusion of ${event.label}: ${event.endDate}`;
    endCap.innerHTML = `
      <div class="spine-range-end-dot" style="border-color: ${palette.primary}; box-shadow: 0 0 10px ${palette.primary};"></div>
      <div class="spine-range-end-label" style="border-color: ${palette.primary}44;">🏁 ${escapeHtml(event.endDate)}</div>
    `;

    beamEl.appendChild(endCap);

    // Interactive Hover Coupling
    const cardEl = itemEl.querySelector('.event-card');
    const pinEl = itemEl.querySelector('.timeline-pin');

    if (pinEl) {
      pinEl.style.borderColor = palette.primary;
    }

    beamEl.addEventListener('mouseenter', () => {
      beamEl.classList.add('active');
      cardEl.style.borderColor = palette.primary;
      cardEl.style.boxShadow = `0 16px 35px -5px rgba(0,0,0,0.8), 0 0 25px ${palette.glow}`;
    });

    beamEl.addEventListener('mouseleave', () => {
      beamEl.classList.remove('active');
      cardEl.style.borderColor = '';
      cardEl.style.boxShadow = '';
    });

    cardEl.addEventListener('mouseenter', () => {
      beamEl.classList.add('active');
    });

    cardEl.addEventListener('mouseleave', () => {
      beamEl.classList.remove('active');
    });

    itemEl.appendChild(beamEl);
  });
}

// ==========================================
// 5. Year Query Navigation Engine
// ==========================================
let activeLocatorTimer = null;

function parseYearQuery(queryStr) {
  if (!queryStr) return null;
  const str = queryStr.trim();
  
  // Check BCE vs AD
  const isBCE = /BCE|BC/i.test(str) || (str.startsWith('-') && !isNaN(parseInt(str, 10)));
  const cleanDigits = str.replace(/BCE|BC|AD|CE/gi, '').replace(/[^\d.-]/g, '').trim();
  if (!cleanDigits) return null;

  const num = Math.abs(parseInt(cleanDigits, 10));
  if (isNaN(num) || num <= 0 || num > 9999) return null;

  // Ensure query is primarily a year query rather than a long sentence containing a digit
  const withoutYear = str.replace(/\b\d{1,4}\b/g, '').replace(/BCE|BC|AD|CE/gi, '').replace(/[-–—]/g, '').trim();
  if (withoutYear.length > 3) return null;

  const sortValue = isBCE ? -num : num;
  const displayLabel = isBCE ? `${num} BCE` : `${num}`;

  return {
    year: num,
    isBCE: isBCE,
    sortValue: sortValue,
    displayLabel: displayLabel
  };
}

function navigateToYearPosition(parsedTarget, isExactMatch) {
  if (!parsedTarget) return;

  const events = state.events;
  if (!events || events.length === 0) return;

  const targetSort = parsedTarget.sortValue;
  const targetLabel = parsedTarget.displayLabel;

  if (isExactMatch) {
    // Check if an event card matches this exact year or active search result
    const matchingEl = DOM.timelineEvents.querySelector('.timeline-item');
    if (matchingEl) {
      setTimeout(() => {
        matchingEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const cardEl = matchingEl.querySelector('.event-card');
        if (cardEl) {
          cardEl.classList.remove('pulse-highlight');
          void cardEl.offsetWidth; // trigger reflow
          cardEl.classList.add('pulse-highlight');
        }
      }, 50);
    }
    removeYearLocator();
    return;
  }

  // Target year has NO direct events: calculate exact chronological position between adjacent events
  let prevEvent = null;
  let nextEvent = null;

  for (let i = 0; i < events.length; i++) {
    if (events[i].sortValue <= targetSort) {
      prevEvent = events[i];
    } else if (events[i].sortValue > targetSort) {
      nextEvent = events[i];
      break;
    }
  }

  let scrollTargetY = 0;

  if (!prevEvent && nextEvent) {
    // Target year is before the earliest event in the active dataset
    const nextEl = document.querySelector(`[data-id="${nextEvent.id}"]`);
    if (nextEl) {
      const topOffset = nextEl.offsetTop;
      scrollTargetY = Math.max(0, topOffset - 60);
      createYearLocatorMarker(scrollTargetY, targetLabel, `Chronological position before earliest event (${nextEvent.displayDate})`);
    }
  } else if (prevEvent && !nextEvent) {
    // Target year is after the latest event in the active dataset
    const prevEl = document.querySelector(`[data-id="${prevEvent.id}"]`);
    if (prevEl) {
      const bottomOffset = prevEl.offsetTop + prevEl.offsetHeight;
      scrollTargetY = bottomOffset + 50;
      createYearLocatorMarker(scrollTargetY, targetLabel, `Chronological position after latest event (${prevEvent.displayDate})`);
    }
  } else if (prevEvent && nextEvent) {
    // Target year falls chronologically between prevEvent and nextEvent
    const prevEl = document.querySelector(`[data-id="${prevEvent.id}"]`);
    const nextEl = document.querySelector(`[data-id="${nextEvent.id}"]`);

    if (prevEl && nextEl) {
      const prevY = prevEl.offsetTop + (prevEl.offsetHeight / 2);
      const nextY = nextEl.offsetTop + (nextEl.offsetHeight / 2);

      const span = nextEvent.sortValue - prevEvent.sortValue;
      const progress = span > 0 ? (targetSort - prevEvent.sortValue) / span : 0.5;
      const clampedProgress = Math.min(0.85, Math.max(0.15, progress));

      scrollTargetY = prevY + (clampedProgress * (nextY - prevY));
      createYearLocatorMarker(
        scrollTargetY, 
        targetLabel, 
        `Timeline position between ${prevEvent.displayDate} and ${nextEvent.displayDate}`
      );
    }
  }

  // Smoothly scroll the container / window to the computed timeline Y coordinate
  setTimeout(() => {
    const containerRect = DOM.timelineContainer.getBoundingClientRect();
    const absoluteY = window.scrollY + containerRect.top + scrollTargetY - (window.innerHeight / 2);
    
    window.scrollTo({
      top: Math.max(0, absoluteY),
      behavior: 'smooth'
    });
  }, 50);

  showToast(`Navigated to Year ${targetLabel} on Timeline`);
}

function createYearLocatorMarker(offsetY, yearLabel, contextSubtitle) {
  removeYearLocator();

  const marker = document.createElement('div');
  marker.className = 'year-locator-marker';
  marker.id = 'activeYearLocator';
  marker.style.top = `${offsetY}px`;

  const isMobile = window.innerWidth <= 860;
  if (isMobile) {
    marker.style.left = '24px';
  } else {
    marker.style.left = '50%';
  }

  marker.innerHTML = `
    <div class="year-locator-pulse"></div>
    <div class="year-locator-card">
      <div class="year-locator-header">
        <span class="year-locator-icon">📍</span>
        <strong class="year-locator-title">Year ${escapeHtml(yearLabel)}</strong>
      </div>
      <div class="year-locator-sub">${escapeHtml(contextSubtitle)}</div>
    </div>
  `;

  DOM.timelineEvents.appendChild(marker);

  // Auto fadeout after 8 seconds
  if (activeLocatorTimer) clearTimeout(activeLocatorTimer);
  activeLocatorTimer = setTimeout(() => {
    removeYearLocator();
  }, 8000);
}

function removeYearLocator() {
  const existing = document.getElementById('activeYearLocator');
  if (existing) existing.remove();
}

function updateStats() {
  const count = state.filteredEvents.length;
  DOM.eventCountBadge.textContent = `${count} ${count === 1 ? 'Event' : 'Events'}`;
}

// ==========================================
// 6. Scroll Progress Tracker for Spine & Back to Top
// ==========================================
let isScrollTicking = false;

function onScrollThrottled() {
  if (!isScrollTicking) {
    window.requestAnimationFrame(() => {
      updateScrollProgress();
      isScrollTicking = false;
    });
    isScrollTicking = true;
  }
}

function updateScrollProgress() {
  const container = DOM.timelineContainer;
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;

  // Toggle Back to Top Button Visibility
  if (DOM.backToTopBtn) {
    if (scrollY > 300) {
      DOM.backToTopBtn.classList.add('visible');
    } else {
      DOM.backToTopBtn.classList.remove('visible');
    }
  }

  if (!container || !DOM.timelineSpineProgress) return;

  const rect = container.getBoundingClientRect();
  const totalHeight = container.offsetHeight;
  if (totalHeight <= 0) return;

  // Detect when user has scrolled to the bottom of the page (with small tolerance for sub-pixel/mobile bounce)
  const isAtBottom = (windowHeight + scrollY >= docHeight - 35);

  let progress;
  if (isAtBottom) {
    progress = 1.0;
  } else {
    // Focal point for reading in viewport (65% down the viewport)
    const focalPoint = windowHeight * 0.65;
    const scrolled = focalPoint - rect.top;

    if (rect.bottom <= focalPoint) {
      progress = 1.0;
    } else {
      progress = Math.min(1.0, Math.max(0, scrolled / totalHeight));
    }
  }

  DOM.timelineSpineProgress.style.height = `${(progress * 100).toFixed(1)}%`;
}

// ==========================================
// 7. Modal System
// ==========================================
function openDetailModal(event) {
  state.selectedEvent = event;

  DOM.modalTitle.textContent = event.label;
  DOM.modalDate.textContent = event.displayDate;
  DOM.modalDescription.textContent = event.description;

  if (event.location) {
    DOM.modalLocationText.textContent = event.location;
    DOM.modalLocationBadge.style.display = 'inline-flex';
  } else {
    DOM.modalLocationBadge.style.display = 'none';
  }

  if (event.isRange && event.durationText) {
    DOM.modalDurationText.textContent = event.durationText;
    DOM.modalDurationBadge.style.display = 'inline-flex';
  } else {
    DOM.modalDurationBadge.style.display = 'none';
  }

  if (event.image) {
    DOM.modalImage.src = event.image;
    DOM.modalImageContainer.style.display = 'block';
  } else {
    DOM.modalImageContainer.style.display = 'none';
  }

  DOM.detailModalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (window.lucide) window.lucide.createIcons();
}

function closeDetailModal() {
  DOM.detailModalBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

function openAddModal() {
  DOM.addModalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
  DOM.eventDateInput.focus();
}

function closeAddModal() {
  DOM.addModalBackdrop.classList.remove('active');
  document.body.style.overflow = '';
  DOM.addEventForm.reset();
}

function closeMobileHeaderDrawer() {
  if (DOM.headerExpandable && DOM.mobileHeaderToggle) {
    DOM.headerExpandable.classList.remove('open');
    DOM.mobileHeaderToggle.classList.remove('active');
    DOM.mobileHeaderToggle.setAttribute('aria-expanded', 'false');

    const defaultIcon = DOM.mobileHeaderToggle.querySelector('.toggle-icon-default');
    const closeIcon = DOM.mobileHeaderToggle.querySelector('.toggle-icon-close');
    if (defaultIcon && closeIcon) {
      defaultIcon.style.display = 'block';
      closeIcon.style.display = 'none';
    }
    setTimeout(calculateSpineRangeBeams, 350);
  }
}

// ==========================================
// 8. Event Listeners & Interactions
// ==========================================
function setupEventListeners() {
  // Mobile Header Options & Search Expand/Collapse Toggle
  if (DOM.mobileHeaderToggle && DOM.headerExpandable) {
    DOM.mobileHeaderToggle.addEventListener('click', () => {
      const isExpanded = DOM.headerExpandable.classList.toggle('open');
      DOM.mobileHeaderToggle.classList.toggle('active', isExpanded);
      DOM.mobileHeaderToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

      const defaultIcon = DOM.mobileHeaderToggle.querySelector('.toggle-icon-default');
      const closeIcon = DOM.mobileHeaderToggle.querySelector('.toggle-icon-close');
      if (defaultIcon && closeIcon) {
        defaultIcon.style.display = isExpanded ? 'none' : 'block';
        closeIcon.style.display = isExpanded ? 'block' : 'none';
      }

      // Recalculate range beams if layout shifted
      setTimeout(calculateSpineRangeBeams, 350);
    });
  }

  // Ultra-Smooth RAF Scroll Listener for Spine & Back-to-Top
  window.addEventListener('scroll', onScrollThrottled, { passive: true });
  window.addEventListener('resize', () => {
    onScrollThrottled();
    calculateSpineRangeBeams();
  }, { passive: true });

  // Back to Top Button Click
  if (DOM.backToTopBtn) {
    DOM.backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Dataset Select Dropdown
  if (DOM.datasetSelect) {
    DOM.datasetSelect.addEventListener('change', (e) => {
      loadDataset(e.target.value);
    });
  }

  // Search Input
  DOM.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    DOM.clearSearchBtn.style.display = state.searchQuery ? 'flex' : 'none';
    applyFilters();
  });

  DOM.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = state.searchQuery.toLowerCase().trim();
      const parsedYear = parseYearQuery(query);
      if (parsedYear) {
        const isFilteredExact = state.filteredEvents.length > 0 && state.filteredEvents.length < state.events.length;
        navigateToYearPosition(parsedYear, isFilteredExact);
        closeMobileHeaderDrawer();
      }
    }
  });

  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.searchInput.value = '';
    state.searchQuery = '';
    DOM.clearSearchBtn.style.display = 'none';
    applyFilters();
  });

  DOM.emptyResetBtn.addEventListener('click', () => {
    state.searchQuery = '';
    DOM.searchInput.value = '';
    DOM.clearSearchBtn.style.display = 'none';
    applyFilters();
  });

  // File Upload
  DOM.csvFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      loadEventsFromCsvContent(event.target.result, `Successfully imported "${file.name}"`);
    };
    reader.onerror = () => {
      showToast('Error reading CSV file');
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Drag and drop CSV onto window
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.type.includes('csv') || file.type.includes('text')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          loadEventsFromCsvContent(event.target.result, `Imported "${file.name}" via drag & drop`);
        };
        reader.readAsText(file);
      } else {
        showToast('Please drop a valid .csv file');
      }
    }
  });

  // Modals Close handlers
  DOM.closeDetailModalBtn.addEventListener('click', closeDetailModal);
  DOM.detailModalBackdrop.addEventListener('click', (e) => {
    if (e.target === DOM.detailModalBackdrop) closeDetailModal();
  });

  DOM.openAddModalBtn.addEventListener('click', openAddModal);
  DOM.closeAddModalBtn.addEventListener('click', closeAddModal);
  DOM.cancelAddBtn.addEventListener('click', closeAddModal);
  DOM.addModalBackdrop.addEventListener('click', (e) => {
    if (e.target === DOM.addModalBackdrop) closeAddModal();
  });

  // ESC key to close modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDetailModal();
      closeAddModal();
    }
  });

  // Add Event Form Submission
  DOM.addEventForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const dateVal = DOM.eventDateInput.value.trim();
    const eraVal = DOM.eventEraSelect.value;
    const labelVal = DOM.eventLabelInput.value.trim();
    const locationVal = DOM.eventLocationInput ? DOM.eventLocationInput.value.trim() : '';
    const descVal = DOM.eventDescInput.value.trim();
    const imageVal = DOM.eventImageInput.value.trim();

    const combinedDate = `${dateVal} ${eraVal}`;
    const hasBCE = state.events.some(evt => evt.isBCE) || eraVal === 'BCE';
    const newEvent = processEventData(combinedDate, labelVal, locationVal, descVal, imageVal, null, hasBCE);

    if (newEvent) {
      state.events.push(newEvent);
      // Re-sort so chronological order is maintained
      state.events.sort((a, b) => a.sortValue - b.sortValue);
      applyFilters();
      closeAddModal();
      showToast(`Added "${labelVal}" to timeline`);

      // Smooth scroll to the newly added item
      setTimeout(() => {
        const itemEl = document.querySelector(`[data-id="${newEvent.id}"]`);
        if (itemEl) {
          itemEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  });
}

// ==========================================
// 9. Utility Functions
// ==========================================
function highlightMatch(text, query) {
  if (!query || !text) return escapeHtml(text || '');
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return escapeHtml(text).replace(regex, '<mark style="background:rgba(212,175,55,0.4);color:#fff;padding:0 2px;border-radius:2px;">$1</mark>');
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let toastTimer = null;
function showToast(message) {
  if (toastTimer) clearTimeout(toastTimer);
  DOM.toastMessage.textContent = message;
  DOM.toast.classList.add('show');
  toastTimer = setTimeout(() => {
    DOM.toast.classList.remove('show');
  }, 3500);
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initTimeline);
