export const TEST1 = `\n\n<mermaid>\ngraph TD\n    A[Installbase (WARP)] -->|Sync Data| B[Price Master]\n    B -->|Push Prices| A\n    B -->|Kafka Event| C[Spark Service]\n    C -->|Consume Data| B\n    B -->|Edit Through Barker UI| B\n</mermaid>\n\n`;
export const TEST2 = `<mermaid>\ngraph TD\n    A[Check Current Price] --> B[Edit Prices]\n    B --> C[View Draft]\n    C --> D[Changeset]\n    D --> E[Submit for Approval]\n    E -->|Approved| F[Approved]\n    F --> G[Activated || Upcoming]\n    E -->|Rejected| H[Rejected]\n    H -->|Cancel Submit| I[Back to Draft]\n    I --> C\n</mermaid>\n\n`;
export const TEST3 = `\n\n<mermaid>\ngraph TD\n    A[\"TRT_ID: 27491\"] --> B[\"Owner Type: Fleet Owned\"]\n    B --> C[\"Charger Type: DC Fast\"]\n    C --> D[\"Price Type: Standard (STD)\"]\n    D --> E[\"Calculation Type: kWh\"]\n    E --> F[\"Price: $0.38\"]\n    F --> G[\"Time Of Use: PPU\"]\n    F --> H[\"Idle Fees: $0.50/$1.00\"]\n</mermaid>\n\n`;
export const TEST4 = `\n\n<mermaid>\ngraph TD\n    A[\"Fleet Owned/Commercial\"] --> B[\"DC Fast / Wall Connector\"]\n    B -->|\"kWh, Minutes, Free, Dynamic\"| C[\"Pricing\"]\n    C -->|\"$0.38, $0.50, $1.00, Congestion Fee\"| D[\"Final Price\"]\n    D -->|\"Validation: Drastic Changes, Price Ceiling\"| E[\"Approval Flow\"]\n    E -->|\"Submit/Cancel/Edit\"| F[\"Changeset Status\"]\n    F -->|\"Approved/Rejected\"| G[\"Activated/Upcoming\"]\n    G -->|\"Kafka Event\"| H[\"Spark Service\"]\n    H -->|\"Consume Updated Data\"| I[\"Price Master\"]\n    I -->|\"Push to Installbase\"| J[\"Installbase (Warp)\"]\n    J -->|\"Sync Data\"| K[\"/installbase/api\"]\n    K -->|\"New Sites/Site Refresh\"| I\n    I -->|\"Edit Through Admin UI\"| I\n</mermaid>\n\n`;

// TEST5: Sequence Diagram
export const TEST5 = `\n\n<mermaid>\nsequenceDiagram\n    participant User as User\n    participant System as System\n    User->>System: Login request\n    System->>User: Login response\n    User->>System: Data request\n    System->>User: Data response\n</mermaid>\n\n`;

// TEST6: Class Diagram
export const TEST6 = `\n\n<mermaid>\nclassDiagram\n    class Animal {\n        +String name\n        +int age\n        +void makeSound()\n    }\n    class Dog {\n        +void bark()\n    }\n    Dog --|> Animal : Inheritance\n</mermaid>\n\n`;

// TEST7: State Diagram
export const TEST7 = `\n\n<mermaid>\nstateDiagram-v2\n    [*] --> Idle\n    Idle --> Active : Start\n    Active --> Idle : Stop\n    Active --> [*] : Terminate\n</mermaid>\n\n`;

// TEST8: Entity-Relationship Diagram (ER Diagram)
export const TEST8 = `\n\n<mermaid>\nerDiagram\n    CUSTOMER ||--o{ ORDER : places\n    ORDER ||--|{ LINE-ITEM : contains\n    CUSTOMER {\n        string name\n        string custNumber\n    }\n    ORDER {\n        int orderNumber\n        date orderDate\n    }\n    LINE-ITEM {\n        string productName\n        int quantity\n        float price\n    }\n</mermaid>\n\n`;

// TEST9: Gantt Chart
export const TEST9 = `\n\n<mermaid>\ngantt\n    title A Gantt Diagram\n    dateFormat  YYYY-MM-DD\n    section Project\n    Task 1           :a1, 2023-01-01, 30d\n    Task 2           :after a1  , 20d\n    Task 3           :2023-02-15  , 10d\n</mermaid>\n\n`;

// TEST10: Pie Chart
export const TEST10 = `\n\n<mermaid>\npie\n    title Key elements in Product X\n    \"Calcium\" : 42.96\n    \"Potassium\" : 50.05\n    \"Magnesium\" : 10.01\n    \"Iron\" : 5\n</mermaid>\n\n`;

// TEST11: Requirement Diagram
export const TEST11 = `\n\n<mermaid>\nrequirementDiagram\n    requirement req1 {\n        id: 1\n        text: The system shall allow user login.\n        risk: High\n        verifymethod: test\n    }\n    requirement req2 {\n        id: 2\n        text: The system shall provide data retrieval.\n        risk: Medium\n        verifymethod: demonstration\n    }\n    req1 - DERIVES -> req2\n</mermaid>\n\n`;

// TEST12: Git Graph
export const TEST12 = `\n\n<mermaid>\ngitGraph\n   commit\n   commit\n   branch develop\n   checkout develop\n   commit\n   commit\n   checkout main\n   merge develop\n   commit\n   commit\n</mermaid>\n\n`;

// TEST13: C4 Diagram
export const TEST13 = `\n\n<mermaid>\nC4Context\n    title System Context diagram for Internet Banking System\n    Enterprise_Boundary(b0, \"BankBoundary0\") {\n        Person(customerA, \"Banking Customer A\", \"A customer of the bank, with personal bank accounts.\")\n        Person(customerB, \"Banking Customer B\")\n        System(SystemAA, \"Internet Banking System\", \"Allows customers to view information about their bank accounts, and make payments.\")\n    }\n\n    System_Ext(SystemEB, \"E-Business System\", \"Allows customers to access their bank accounts via an internet banking system.\")\n    System_Ext(SystemMB, \"Mainframe Banking System\", \"Stores all of the core banking information about customers, accounts, transactions, etc.\")\n\n    Rel(customerA, SystemAA, \"Uses\")\n    Rel(SystemAA, SystemMB, \"Uses\")\n    Rel(SystemAA, SystemEB, \"Uses\")\n</mermaid>\n\n`;

// TEST14: Mindmap
export const TEST14 = `\n\n<mermaid>\nmindmap\n  root((MindMap))\n    Origins\n      Universally known\n    Uses\n      Creative projects\n      Note-taking\n      Knowledge management\n      Project management\n        (Gantt chart|PERT chart)\n</mermaid>\n\n`;

// TEST15: Timeline
export const TEST15 = `\n\n<mermaid>\ntimeline\n    title History of the Internet\n    1969 : ARPANET\n    1983 : TCP/IP\n    1989 : World Wide Web proposed\n    1991 : First website\n    1993 : Mosaic browser\n    1998 : Google founded\n</mermaid>\n\n`;

// TEST16: Quadrant Chart
export const TEST16 = `\n\n<mermaid>\nquadrantChart\n    title Reach and Engagement of Campaigns\n    x-axis Low Reach --> High Reach\n    y-axis Low Engagement --> High Engagement\n    quadrant-1 We should expand\n    quadrant-2 Need to promote\n    quadrant-3 Re-evaluate\n    quadrant-4 May be improved\n    Campaign A: [0.3, 0.6]\n    Campaign B: [0.45, 0.23]\n    Campaign C: [0.57, 0.69]\n    Campaign D: [0.78, 0.34]\n    Campaign E: [0.40, 0.34]\n    Campaign F: [0.34, 0.78]\n</mermaid>\n\n`;

// TEST17: XY Chart (Scatter/Line)
export const TEST17 = `\n\n<mermaid>\nxychart-beta\n    title "Sales vs. Time"\n    x-axis "Time" 0 --> 4\n    y-axis "Sales" 0 --> 40\n    line "Sales" [10, 15, 20, 25, 30]\n    line "Data" [12, 14, 18, 22, 28]\n</mermaid>\n\n`;
