/**
 * Offline fallback fixtures.
 *
 * Generated from the running backend so the two stay identical. The demo
 * prefers live data from Spring Boot; these are used only when the API is
 * unreachable, so a dead backend degrades the demo instead of ending it.
 */

export const FALLBACK_STUDENT = {
  "id": "morgan-thibodaux",
  "name": "Morgan A. Thibodaux",
  "initials": "MT",
  "major": "Finance + CS",
  "year": "Junior",
  "gpa": 3.89,
  "targetRole": "Investment Banker",
  "matchPercent": 87,
  "matchBasis": "Based on GPA 3.89, ACCN-2010 (A+), and three other signals. NYC-weighted. 5 Freeman '24 alumni placed in IB out of 73% of the cohort. Morgan's fit: 87%.",
  "matchSource": "Source: 12Twenty · Freeman outcomes Q3 '25 · Tulane alumni hiring data",
  "onboarded": false,
  "adjacentPaths": [
    {
      "title": "Private Equity Analyst",
      "fitPercent": 79
    },
    {
      "title": "M&A Consultant",
      "fitPercent": 71
    },
    {
      "title": "Corporate Strategy",
      "fitPercent": 64
    },
    {
      "title": "Hedge Fund Research",
      "fitPercent": 58
    }
  ],
  "concerns": [
    {
      "title": "The technical screen",
      "detail": "Froze on an LBO walk-through in my last mock — need reps before Goldman Round 2.",
      "tone": "rose"
    },
    {
      "title": "NYC cost of living",
      "detail": "No family support for move-in; rent + signing-bonus math isn't adding up.",
      "tone": "amber"
    },
    {
      "title": "Feels \"non-traditional\"",
      "detail": "Finance+CS, not pure Wharton pedigree — am I reading the room right?",
      "tone": "violet"
    },
    {
      "title": "Consulting fallback",
      "detail": "MBB apps still warm — worth keeping, or full send on banking?",
      "tone": "sky"
    }
  ],
  "firms": [
    {
      "mark": "GS",
      "name": "Goldman Sachs",
      "subtitle": "IB Summer Analyst · NYC · 5 Freeman alumni",
      "favorite": true
    },
    {
      "mark": "MS",
      "name": "Morgan Stanley",
      "subtitle": "M&A Analyst · NYC · 3 Freeman alumni",
      "favorite": true
    },
    {
      "mark": "SF",
      "name": "Stifel",
      "subtitle": "IB Analyst · Midwest · Freeman pipeline school",
      "favorite": true
    }
  ],
  "strategies": [
    {
      "number": "01",
      "text": "LBO drill w/ Sarah Kim"
    },
    {
      "number": "02",
      "text": "Reframe Finance+CS as edge"
    },
    {
      "number": "03",
      "text": "Send NYC housing + stipend info"
    }
  ],
  "transcript": [
    {
      "term": "Fall '23",
      "code": "ACCN 2010",
      "title": "Financial Accounting",
      "credits": 3.0,
      "grade": "A+"
    },
    {
      "term": "Fall '23",
      "code": "ECON 1010",
      "title": "Microeconomic Principles",
      "credits": 3.0,
      "grade": "A"
    },
    {
      "term": "Fall '23",
      "code": "CMPS 1500",
      "title": "Introduction to Computer Science",
      "credits": 4.0,
      "grade": "A"
    },
    {
      "term": "Spring '24",
      "code": "FINE 3010",
      "title": "Corporate Finance",
      "credits": 3.0,
      "grade": "A"
    },
    {
      "term": "Spring '24",
      "code": "CMPS 2200",
      "title": "Data Structures and Algorithms",
      "credits": 4.0,
      "grade": "A-"
    },
    {
      "term": "Spring '24",
      "code": "MATH 1220",
      "title": "Calculus II",
      "credits": 4.0,
      "grade": "B+"
    },
    {
      "term": "Fall '24",
      "code": "FINE 4020",
      "title": "Investments",
      "credits": 3.0,
      "grade": "A"
    },
    {
      "term": "Fall '24",
      "code": "BSAN 3010",
      "title": "Business Analytics",
      "credits": 3.0,
      "grade": "A"
    },
    {
      "term": "Fall '24",
      "code": "ACCN 3010",
      "title": "Managerial Accounting",
      "credits": 3.0,
      "grade": "A-"
    },
    {
      "term": "Spring '25",
      "code": "FINE 4110",
      "title": "Financial Modeling",
      "credits": 3.0,
      "grade": "A+"
    },
    {
      "term": "Spring '25",
      "code": "CMPS 3140",
      "title": "Database Systems",
      "credits": 3.0,
      "grade": "A"
    },
    {
      "term": "Spring '25",
      "code": "PHIL 2010",
      "title": "Ethics in Business",
      "credits": 3.0,
      "grade": "B+"
    }
  ],
  "courses": [
    {
      "code": "FINE 4150",
      "title": "Advanced Corporate Valuation",
      "why": "LBO, DCF, and M&A modeling — exactly what Goldman Round 2 will screen for.",
      "instructor": "Dr. Pham",
      "meeting": "TR 9:30",
      "fit": "A+"
    },
    {
      "code": "ACCN 3100",
      "title": "Financial Statement Analysis",
      "why": "Extends your ACCN-2010 A+ — writing-intensive, strengthens the banker narrative.",
      "instructor": "Dr. Okonkwo",
      "meeting": "W 14:00",
      "fit": "A"
    },
    {
      "code": "CMPS 3240",
      "title": "Quantitative Methods in Finance",
      "why": "Your Finance+CS edge — Python/SQL for trading desks. 4 Goldman alumni took this.",
      "instructor": "Prof. Arroyo",
      "meeting": "MW 11:00",
      "fit": "A−"
    },
    {
      "code": "FINE 3320",
      "title": "Mergers, Acquisitions & Restructuring",
      "why": "M&A Consultant adjacent path (71% fit) — hedge if banking Round 2 stalls.",
      "instructor": "Dr. Varma",
      "meeting": "TR 13:00",
      "fit": "B+"
    }
  ],
  "conversations": [
    {
      "initials": "SK",
      "name": "Sarah Kim",
      "role": "Freeman '16 · Goldman IBD",
      "snippet": "Happy to chat — Thursday 3pm ET works. I can walk you through how I prepped for my LBO round and what stumped me my first pass.",
      "prefix": null,
      "status": "reply",
      "statusLabel": "Replied",
      "meta": "NYC · 1st degree",
      "time": "12 min",
      "unread": true
    },
    {
      "initials": "DC",
      "name": "David Chen",
      "role": "Freeman '20 · JPM M&A",
      "snippet": "Thanks for the modeling tips — I finished the case prep and would love your read before Goldman Round 2 on Jan 14.",
      "prefix": "You:",
      "status": "sent",
      "statusLabel": "Sent",
      "meta": "NYC · Warm intro via Bill",
      "time": "4h",
      "unread": false
    },
    {
      "initials": "RP",
      "name": "Rachel Pham",
      "role": "Freeman '19 · Evercore M&A",
      "snippet": "Hi Rachel — Bill mentioned your path from Freeman into Evercore. I'm targeting IB for Summer '26 and would love 20 minutes to hear how you framed Finance+CS.",
      "prefix": "Draft:",
      "status": "draft",
      "statusLabel": "Draft ready",
      "meta": "NYC · 2nd degree",
      "time": "Yesterday",
      "unread": false
    },
    {
      "initials": "MO",
      "name": "Marcus Okafor",
      "role": "Freeman '21 · Analyst Goldman TMT",
      "snippet": "Glad the coffee chat helped. Let me know once you hear back from the Goldman recruiter — happy to ping her a second time if it goes quiet.",
      "prefix": null,
      "status": "warm",
      "statusLabel": "Reply owed",
      "meta": "NYC · 1st degree",
      "time": "3d",
      "unread": false
    }
  ],
  "weeklyActions": [
    {
      "title": "Update resume headline",
      "detail": "Swapped \"aspiring\" for \"Finance + CS analyst — IB track.\"",
      "meta": "Done Nov 12",
      "done": true
    },
    {
      "title": "Submit 4 more IB applications",
      "detail": "Cohort median is 23 by end of November; you're at 14.",
      "meta": "Due Fri · via 12Twenty",
      "done": false
    },
    {
      "title": "Pre-register FINE 4150",
      "detail": "Spring enrollment opens tomorrow — Dr. Pham's valuation section fills fast.",
      "meta": "Due Wed · Registrar",
      "done": false
    },
    {
      "title": "Review Sarah's reply with Bill",
      "detail": "Your next appointment is scheduled for 11:30 today.",
      "meta": "Today · 11:30",
      "done": false
    }
  ]
};

export const FALLBACK_ADVISOR_DASHBOARD = {
  "advisor": {
    "id": "bill-hudlow",
    "name": "Bill Hudlow",
    "initials": "BH",
    "title": "Freeman · Consultant",
    "studentCount": 28,
    "appointmentCount": 7
  },
  "nextStudent": {
    "id": "morgan-thibodaux",
    "name": "Morgan A. Thibodaux",
    "initials": "MT",
    "major": "Finance + CS",
    "year": "Junior",
    "gpa": 3.89,
    "targetRole": "Investment Banker",
    "matchPercent": 87,
    "matchBasis": "Based on GPA 3.89, ACCN-2010 (A+), and three other signals. NYC-weighted. 5 Freeman '24 alumni placed in IB out of 73% of the cohort. Morgan's fit: 87%.",
    "matchSource": "Source: 12Twenty · Freeman outcomes Q3 '25 · Tulane alumni hiring data",
    "onboarded": false,
    "adjacentPaths": [
      {
        "title": "Private Equity Analyst",
        "fitPercent": 79
      },
      {
        "title": "M&A Consultant",
        "fitPercent": 71
      },
      {
        "title": "Corporate Strategy",
        "fitPercent": 64
      },
      {
        "title": "Hedge Fund Research",
        "fitPercent": 58
      }
    ],
    "concerns": [
      {
        "title": "The technical screen",
        "detail": "Froze on an LBO walk-through in my last mock — need reps before Goldman Round 2.",
        "tone": "rose"
      },
      {
        "title": "NYC cost of living",
        "detail": "No family support for move-in; rent + signing-bonus math isn't adding up.",
        "tone": "amber"
      },
      {
        "title": "Feels \"non-traditional\"",
        "detail": "Finance+CS, not pure Wharton pedigree — am I reading the room right?",
        "tone": "violet"
      },
      {
        "title": "Consulting fallback",
        "detail": "MBB apps still warm — worth keeping, or full send on banking?",
        "tone": "sky"
      }
    ],
    "firms": [
      {
        "mark": "GS",
        "name": "Goldman Sachs",
        "subtitle": "IB Summer Analyst · NYC · 5 Freeman alumni",
        "favorite": true
      },
      {
        "mark": "MS",
        "name": "Morgan Stanley",
        "subtitle": "M&A Analyst · NYC · 3 Freeman alumni",
        "favorite": true
      },
      {
        "mark": "SF",
        "name": "Stifel",
        "subtitle": "IB Analyst · Midwest · Freeman pipeline school",
        "favorite": true
      }
    ],
    "strategies": [
      {
        "number": "01",
        "text": "LBO drill w/ Sarah Kim"
      },
      {
        "number": "02",
        "text": "Reframe Finance+CS as edge"
      },
      {
        "number": "03",
        "text": "Send NYC housing + stipend info"
      }
    ],
    "transcript": [
      {
        "term": "Fall '23",
        "code": "ACCN 2010",
        "title": "Financial Accounting",
        "credits": 3.0,
        "grade": "A+"
      },
      {
        "term": "Fall '23",
        "code": "ECON 1010",
        "title": "Microeconomic Principles",
        "credits": 3.0,
        "grade": "A"
      },
      {
        "term": "Fall '23",
        "code": "CMPS 1500",
        "title": "Introduction to Computer Science",
        "credits": 4.0,
        "grade": "A"
      },
      {
        "term": "Spring '24",
        "code": "FINE 3010",
        "title": "Corporate Finance",
        "credits": 3.0,
        "grade": "A"
      },
      {
        "term": "Spring '24",
        "code": "CMPS 2200",
        "title": "Data Structures and Algorithms",
        "credits": 4.0,
        "grade": "A-"
      },
      {
        "term": "Spring '24",
        "code": "MATH 1220",
        "title": "Calculus II",
        "credits": 4.0,
        "grade": "B+"
      },
      {
        "term": "Fall '24",
        "code": "FINE 4020",
        "title": "Investments",
        "credits": 3.0,
        "grade": "A"
      },
      {
        "term": "Fall '24",
        "code": "BSAN 3010",
        "title": "Business Analytics",
        "credits": 3.0,
        "grade": "A"
      },
      {
        "term": "Fall '24",
        "code": "ACCN 3010",
        "title": "Managerial Accounting",
        "credits": 3.0,
        "grade": "A-"
      },
      {
        "term": "Spring '25",
        "code": "FINE 4110",
        "title": "Financial Modeling",
        "credits": 3.0,
        "grade": "A+"
      },
      {
        "term": "Spring '25",
        "code": "CMPS 3140",
        "title": "Database Systems",
        "credits": 3.0,
        "grade": "A"
      },
      {
        "term": "Spring '25",
        "code": "PHIL 2010",
        "title": "Ethics in Business",
        "credits": 3.0,
        "grade": "B+"
      }
    ],
    "courses": [
      {
        "code": "FINE 4150",
        "title": "Advanced Corporate Valuation",
        "why": "LBO, DCF, and M&A modeling — exactly what Goldman Round 2 will screen for.",
        "instructor": "Dr. Pham",
        "meeting": "TR 9:30",
        "fit": "A+"
      },
      {
        "code": "ACCN 3100",
        "title": "Financial Statement Analysis",
        "why": "Extends your ACCN-2010 A+ — writing-intensive, strengthens the banker narrative.",
        "instructor": "Dr. Okonkwo",
        "meeting": "W 14:00",
        "fit": "A"
      },
      {
        "code": "CMPS 3240",
        "title": "Quantitative Methods in Finance",
        "why": "Your Finance+CS edge — Python/SQL for trading desks. 4 Goldman alumni took this.",
        "instructor": "Prof. Arroyo",
        "meeting": "MW 11:00",
        "fit": "A−"
      },
      {
        "code": "FINE 3320",
        "title": "Mergers, Acquisitions & Restructuring",
        "why": "M&A Consultant adjacent path (71% fit) — hedge if banking Round 2 stalls.",
        "instructor": "Dr. Varma",
        "meeting": "TR 13:00",
        "fit": "B+"
      }
    ],
    "conversations": [
      {
        "initials": "SK",
        "name": "Sarah Kim",
        "role": "Freeman '16 · Goldman IBD",
        "snippet": "Happy to chat — Thursday 3pm ET works. I can walk you through how I prepped for my LBO round and what stumped me my first pass.",
        "prefix": null,
        "status": "reply",
        "statusLabel": "Replied",
        "meta": "NYC · 1st degree",
        "time": "12 min",
        "unread": true
      },
      {
        "initials": "DC",
        "name": "David Chen",
        "role": "Freeman '20 · JPM M&A",
        "snippet": "Thanks for the modeling tips — I finished the case prep and would love your read before Goldman Round 2 on Jan 14.",
        "prefix": "You:",
        "status": "sent",
        "statusLabel": "Sent",
        "meta": "NYC · Warm intro via Bill",
        "time": "4h",
        "unread": false
      },
      {
        "initials": "RP",
        "name": "Rachel Pham",
        "role": "Freeman '19 · Evercore M&A",
        "snippet": "Hi Rachel — Bill mentioned your path from Freeman into Evercore. I'm targeting IB for Summer '26 and would love 20 minutes to hear how you framed Finance+CS.",
        "prefix": "Draft:",
        "status": "draft",
        "statusLabel": "Draft ready",
        "meta": "NYC · 2nd degree",
        "time": "Yesterday",
        "unread": false
      },
      {
        "initials": "MO",
        "name": "Marcus Okafor",
        "role": "Freeman '21 · Analyst Goldman TMT",
        "snippet": "Glad the coffee chat helped. Let me know once you hear back from the Goldman recruiter — happy to ping her a second time if it goes quiet.",
        "prefix": null,
        "status": "warm",
        "statusLabel": "Reply owed",
        "meta": "NYC · 1st degree",
        "time": "3d",
        "unread": false
      }
    ],
    "weeklyActions": [
      {
        "title": "Update resume headline",
        "detail": "Swapped \"aspiring\" for \"Finance + CS analyst — IB track.\"",
        "meta": "Done Nov 12",
        "done": true
      },
      {
        "title": "Submit 4 more IB applications",
        "detail": "Cohort median is 23 by end of November; you're at 14.",
        "meta": "Due Fri · via 12Twenty",
        "done": false
      },
      {
        "title": "Pre-register FINE 4150",
        "detail": "Spring enrollment opens tomorrow — Dr. Pham's valuation section fills fast.",
        "meta": "Due Wed · Registrar",
        "done": false
      },
      {
        "title": "Review Sarah's reply with Bill",
        "detail": "Your next appointment is scheduled for 11:30 today.",
        "meta": "Today · 11:30",
        "done": false
      }
    ]
  },
  "nextAppointment": {
    "id": "appt-1",
    "studentId": "morgan-thibodaux",
    "studentName": "Morgan A. Thibodaux",
    "initials": "MT",
    "time": "11:30 AM",
    "major": "Finance + CS",
    "year": "Junior",
    "gpa": 3.82,
    "track": "Investment Banking",
    "tags": [
      "Interview Thursday",
      "Pre-brief ready"
    ]
  },
  "schedule": [
    {
      "id": "appt-1",
      "studentId": "morgan-thibodaux",
      "studentName": "Morgan A. Thibodaux",
      "initials": "MT",
      "time": "11:30 AM",
      "major": "Finance + CS",
      "year": "Junior",
      "gpa": 3.82,
      "track": "Investment Banking",
      "tags": [
        "Interview Thursday",
        "Pre-brief ready"
      ]
    },
    {
      "id": "appt-2",
      "studentId": "jasmine-okoye",
      "studentName": "Jasmine L. Okoye",
      "initials": "JL",
      "time": "1:00 PM",
      "major": "Public Health",
      "year": "Senior",
      "gpa": 3.91,
      "track": "Healthcare Consulting",
      "tags": [
        "Undecided between 2 offers"
      ]
    },
    {
      "id": "appt-3",
      "studentId": "diego-ramirez",
      "studentName": "Diego Ramirez",
      "initials": "DR",
      "time": "2:15 PM",
      "major": "Econ",
      "year": "Sophomore",
      "gpa": 3.65,
      "track": "Exploring",
      "tags": [
        "First session",
        "Needs fingerprint"
      ]
    },
    {
      "id": "appt-4",
      "studentId": "alex-park",
      "studentName": "Alex Park",
      "initials": "AP",
      "time": "3:45 PM",
      "major": "CS",
      "year": "Junior",
      "gpa": 3.78,
      "track": "Product Management",
      "tags": [
        "3 alumni matches"
      ]
    }
  ],
  "updates": [
    {
      "kind": "alert",
      "time": "3 min ago",
      "title": "Morgan Thibodaux has an interview Thursday",
      "detail": "Goldman Sachs, NYC. Pre-brief auto-generated — 3 alumni intros staged."
    },
    {
      "kind": "check",
      "time": "1 hr ago",
      "title": "3 Freeman '22 alumni just updated titles",
      "detail": "Two to VP at JPM, one lateral to Blackstone PE. Added to radar."
    },
    {
      "kind": "spark",
      "time": "Yesterday",
      "title": "New fingerprint: Diego Ramirez",
      "detail": "Initial scan complete. Three exploratory tracks surfaced."
    },
    {
      "kind": "report",
      "time": "2 days ago",
      "title": "Q1 placement report available",
      "detail": "73.2% placed within 90 days of graduation. +4.1 pts vs. last cohort."
    }
  ],
  "alumniRadar": [
    {
      "initials": "AC",
      "name": "Anna Chen '22",
      "school": "Freeman · Finance",
      "newRole": "VP, Investment Banking · Goldman Sachs",
      "city": "New York, NY",
      "matches": 3,
      "matchLabel": "3 students"
    },
    {
      "initials": "MK",
      "name": "Marcus Kim '21",
      "school": "Freeman · Finance + CS",
      "newRole": "Principal · Blackstone PE",
      "city": "New York, NY",
      "matches": 2,
      "matchLabel": "2 students"
    },
    {
      "initials": "RP",
      "name": "Rahul Patel '23",
      "school": "SSE · Computer Science",
      "newRole": "SWE-III · Anthropic",
      "city": "San Francisco, CA",
      "matches": 1,
      "matchLabel": "1 student"
    },
    {
      "initials": "SG",
      "name": "Sarah Goldberg '20",
      "school": "SLA · Public Health",
      "newRole": "Associate · McKinsey Health",
      "city": "Boston, MA",
      "matches": 2,
      "matchLabel": "2 students"
    },
    {
      "initials": "JW",
      "name": "James Whitfield '22",
      "school": "Freeman · Accounting",
      "newRole": "Senior Manager · KPMG M&A",
      "city": "Chicago, IL",
      "matches": 0,
      "matchLabel": "0 matches"
    }
  ]
};

export const FALLBACK_USERS = [
  {
    email: "morgan@tulane.edu",
    password: "streetcar",
    role: "STUDENT",
    profileId: "morgan-thibodaux",
    displayName: "Morgan A. Thibodaux",
    initials: "MT",
    subtitle: "Finance + CS \u00b7 Junior",
  },
  {
    email: "bill.hudlow@tulane.edu",
    password: "streetcar",
    role: "ADVISOR",
    profileId: "bill-hudlow",
    displayName: "Bill Hudlow",
    initials: "BH",
    subtitle: "Freeman \u00b7 Consultant",
  },
];
